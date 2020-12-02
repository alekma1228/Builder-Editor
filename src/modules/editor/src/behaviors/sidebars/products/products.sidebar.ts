import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap, } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject, } from 'rxjs';
import { isEmpty } from 'lodash';

import { PebElementContext, PebElementDef, PebElementStyles, } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { SidebarBasic } from '../_deprecated-sidebars/sidebar.basic';
import { TextAlignmentConstants } from '../_deprecated-sidebars/shared/text/text-style.constants';
import { Axis, PebEditorElement } from '../../../renderer/editor-element';
import { getColumnsAndRows } from './products.utils';
import { Font } from './products-font.behavior';
import { PebEditorElementPropertyDimensions } from '../../../renderer/interfaces';

interface PebProductsSidebarChanges {
  styles: PebElementStyles;
}

export enum ImageCornersConstants {
  RIGHT = 'right',
  ROUNDED = 'rounded',
}

export interface ProductsStyles {
  initialValue: {
    textAlign: TextAlignmentConstants;
    imageCorners: ImageCornersConstants;
  };
  form: FormGroup;
  update: () => void;
  submit: Subject<any>;
}

const ROUNDED_BORDER = 6;

@Component({
  selector: 'peb-editor-products-sidebar',
  templateUrl: 'products.sidebar.html',
  styleUrls: [
    './products.sidebar.scss',
    '../_deprecated-sidebars/sidebars.scss',
  ],
})
export class PebEditorProductsSidebarComponent extends SidebarBasic implements OnInit {
  @Input() component: PebEditorElement;

  @Input() set element(element: PebElementDef) {
    this.elementSubject$.next(element);
  }

  @Input() get element$() {
    return this.elementSubject$.asObservable();
  }

  @Input()
  set styles(styles: PebElementStyles) {
    this.stylesSubject$.next(styles);
  }

  get styles(): PebElementStyles {
    return this.stylesSubject$.value;
  }

  @Input() set context(context: PebElementContext<any>) {
    this.contextSubject$.next(context);
  }

  @Output() openProductsGrid = new EventEmitter();
  @Output() removeProductHandler = new EventEmitter();

  private readonly elementSubject$ = new BehaviorSubject<PebElementDef>(null);
  private readonly stylesSubject$ = new BehaviorSubject<PebElementStyles>(null);
  private readonly contextSubject$ = new BehaviorSubject<PebElementContext<any>>(null);

  titleFont: Font;
  priceFont: Font;
  productDimensions: PebEditorElementPropertyDimensions;
  products: ProductsStyles;
  _component: PebEditorElement = null;

  context$: Observable<
    PebElementContext<any>
  > = this.contextSubject$.asObservable();

  textAlignmentConstants = TextAlignmentConstants;
  imageCornersConstants = ImageCornersConstants;

  constructor(
    api: PebEditorApi,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    super(api);
  }

  ngOnInit() {
    combineLatest([
      this.elementSubject$,
      this.stylesSubject$,
      this.contextSubject$,
    ])
      .pipe(
        tap(([element, styles, context]) => {
          if (!this.form) {
            this.initForm(element, styles, context);
            return;
          }

          this.patchForm(element, styles, context);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

      this.form.get('template').get('columns').valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(100),
          tap(columns => {
            const {
              productTemplateColumns,
              productTemplateRows,
            } = getColumnsAndRows(this.component);
            this.component.productDimensions.update();
            this.component.dimensions.update();
            this.component.dimensions.form.patchValue({
              width: Math.max(
                this.component.getMinPossibleDimensions(Axis.Horizontal),
                this.component.productDimensions.form.value.width * columns +
                  productTemplateColumns * 15,
              ),
              height:
                this.component.productDimensions.form.value.height *
                productTemplateRows,
            });
            this.component.productDimensions.submit.next();
          }),
          takeUntil(this.destroyed$),
        )
        .subscribe();
  }

  get changes(): Observable<PebProductsSidebarChanges> {
    return this.form.valueChanges.pipe(
      map(() => this.getDirtyValues()),
      filter(values => !isEmpty(values)),
      map(dirtyChanges => this.mapChanges(dirtyChanges)),
      map(changes => this.calculateAdditionalChanges(changes)),
      tap(() => {
        this.component.productDimensions.activate();
        this.component.productDimensions.submit.next();
      }),
    );
  }

  removeProduct(product: any) {
    this.removeProductHandler.emit(product);
  }

  private initForm(
    _: PebElementDef,
    styles: PebElementStyles,
    context: PebElementContext<any>,
  ) {
    const imageCorners =
      this.styles.imageCorners || ImageCornersConstants.RIGHT;

    this.form = this.fb.group({
      template: this.fb.group({
        columns: [
          styles.productTemplateColumns,
          [Validators.min(1), Validators.max(context?.data?.length)],
        ],
        rows: [
          {
            value: styles.productTemplateRows,
            disabled: context?.data?.length,
          },
          [Validators.min(1)],
        ],
      }),
      textAlign: !this.styles.textAlign
        ? TextAlignmentConstants.CENTER
        : this.styles.textAlign,
      imageCorners,
      borderRadius: this.styles.borderRadius,
    });
  }

  private patchForm(
    _: PebElementDef,
    styles: PebElementStyles,
    context: PebElementContext<any>,
  ) {
    if (!this.form) {
      return;
    }

    this.form.patchValue(
      {
        template: {
          columns: [styles.productTemplateColumns],
          rows: [styles.productTemplateRows],
        },
      },
      { emitEvent: false },
    );

    (this.form.controls.template as FormGroup).controls.columns.setValidators([
      Validators.min(1),
      Validators.max(context?.data?.length),
    ]);
  }

  private mapChanges(changes: any): PebProductsSidebarChanges {
    return {
      styles: {
        ...(typeof changes?.template?.columns !== 'undefined' && {
          productTemplateColumns: changes?.template?.columns,
        }),
        ...(typeof changes?.template?.rows !== 'undefined' && {
          productTemplateRows: changes?.template?.rows,
        }),
        ...('textAlign' in changes && { textAlign: changes.textAlign }),
        ...('imageCorners' in changes && {
          imageCorners: changes.imageCorners,
        }),
        ...('imageCorners' in changes && {
          borderRadius:
            changes.imageCorners === ImageCornersConstants.RIGHT
              ? 0
              : ROUNDED_BORDER,
        }),
      },
    };
  }

  private calculateAdditionalChanges(
    changes: PebProductsSidebarChanges,
  ): PebProductsSidebarChanges {
    if (
      changes.styles.productTemplateColumns &&
      this.contextSubject$.value?.data?.length
    ) {
      const nextRows = Math.ceil(
        this.contextSubject$.value?.data?.length /
          +changes.styles.productTemplateColumns,
      );
      changes.styles.productTemplateRows = nextRows;

      this.patchForm(
        this.elementSubject$.value,
        changes.styles,
        this.contextSubject$.value,
      );
    }

    return changes;
  }

  private getDirtyValues(form: FormGroup | AbstractControl = this.form) {
    return Object.keys((form as FormGroup).controls).reduce((acc, key) => {
      const currentControl = (form as FormGroup).controls[key];

      if (
        (currentControl.dirty && currentControl.valid) ||
        ('imageCorners' in acc && key === 'borderRadius')
      ) {
        acc[key] = (currentControl as FormGroup).controls
          ? this.getDirtyValues(currentControl)
          : currentControl.value;
      }

      return acc;
    }, {});
  }

  updateStyle(controlName: string, value: string) {
    const control = this.form.get(controlName);
    control.markAsDirty();
    control.patchValue(value);
  }
}
