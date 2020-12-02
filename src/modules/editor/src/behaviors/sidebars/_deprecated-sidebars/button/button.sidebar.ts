import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { delay, filter, finalize, map, take, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';

import {
  PebElementDef,
  PebElementStyles,
  PebInteractionType,
  PebPageType,
  PebShopRoute,
  PebShopThemeSnapshot,
  PEB_DEFAULT_FONT_SIZE,
} from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { PebEditorElement } from '../../../../renderer/editor-element';
import {
  borderOptions,
  fillOptions,
  fontOptions,
  pageOptions,
} from './button.variables';
import { SidebarBasic } from '../sidebar.basic';
import { PebEditorNumberInputComponent } from '../shared/number-input/number-input.component';
import { PebEditorStore } from '../../../../services/editor.store';

@Component({
  selector: 'peb-editor-button-sidebar',
  templateUrl: './button.sidebar.html',
  styleUrls: ['./button.sidebar.scss'],
})
export class PebEditorButtonSidebarComponent extends SidebarBasic implements OnInit, OnDestroy {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() component: PebEditorElement;

  @Output() changeElement = new EventEmitter<any>();
  @Output() changeStyle = new EventEmitter<any>();
  @Output() changeElementFinal = new EventEmitter<any>();
  @Output() changeStyleFinal = new EventEmitter<any>();

  backgroundColors = ['#00a2ff', '#61d835', '#ee220d', '#f8ba00', '#ef5fa7', '#000000'];

  PebInteractionType = PebInteractionType;

  isLinkPathVisible = true;

  range: any = 80;
  color: string;
  borderColor: string;
  columns = 3;
  rows = 2;

  form = new FormGroup({
    borderWidth: new FormControl(0),
    fontSize: new FormControl(0),
    borderRadius: new FormControl(0),
    borderColor: new FormControl('#07c'),
    color: new FormControl('#fff'),
    shadowBlur: new FormControl(0),
    shadowSpread: new FormControl(0),
    angle: new FormControl(0),
    linkType: new FormControl('none'),
    linkToPage: new FormControl(),
    linkCustom: new FormControl(),
    hasBorder: new FormControl(false),
    hasShadow: new FormControl(false),
    borderStyle: new FormControl(),
    borderStyleType: new FormControl(),
    backgroundFill: new FormControl('Color fill'),
    backgroundColor: new FormControl(),
    background: new FormControl(''),
    fontFamily: new FormControl(),
    fontStyle: new FormControl(),
    paragraphStyle: new FormControl(),
    gradientAngle: new FormControl(0),
    gradientStartColor: new FormControl('rgb(66, 161, 236)'),
    gradientStopColor: new FormControl('rgb(0, 112, 201)'),
  });

  readonly routes$: Observable<any> = this.store.snapshot$.pipe(
    filter(Boolean),
    map((snapshot: PebShopThemeSnapshot) =>
      snapshot.shop.routing.reduce((acc, route: PebShopRoute) => {
        if (snapshot.pages[route?.pageId]?.type !== PebPageType.Master) {
          acc.push({
            title: snapshot.pages[route.pageId]?.name,
            path: route.routeId,
            route: route.url,
          });
        }
        return acc;
      }, []),
    ),
  );

  fontOptions = fontOptions;
  pageOptions = pageOptions;
  fillOptions = fillOptions;
  borderOptions = borderOptions;

  private activeElement: PebEditorNumberInputComponent = null;

  constructor(
    public store: PebEditorStore,
    public api: PebEditorApi,
    public cdr: ChangeDetectorRef
  ) {
    super(api);
  }

  ngOnInit(): void {

    merge(
      this.initialButton$,
      this.changesButtonForm$,
      this.form.get('linkToPage').valueChanges.pipe(
        tap((event) => {
          this.linkHandler(PebInteractionType.NavigateInternal, event);
          this.isLinkPathVisible = false;
        }),
        delay(300),
        tap(() => {
          this.isLinkPathVisible = true;
          this.cdr.detectChanges();
        }),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
      finalize(() => {
        // const styles = this.form.getRawValue();
        // this.changeStyleFinal.next(styles);
      }),
    ).subscribe();
  }

  get initialButton$() {
    return  of(true).pipe(
      take(1),
      tap(() => {
        // let backgroundFill = 'Color fill';
        // let backgroundColor = this.styles.background || '#d4d4d4';
        // const background = this.styles.background || 'rgb(66, 161, 236)';
        // let gradientAngle = 0;
        // let gradientStartColor = 'rgb(66, 161, 236)';
        // let gradientStopColor = 'rgb(0, 112, 201)';

        if (this.styles.background && this.styles.background.toString().indexOf('linear-gradient') > -1) {

          // const gradient = parseLinearGradient(this.styles.background.toString());
          // backgroundFill = 'Color fill';
          // backgroundColor = gradient.startColor;
          // gradientAngle = gradient.angle ? sizeToNumber(gradient.angle) : 0;
          // gradientStartColor = gradient.startColor;
          // gradientStopColor = gradient.endColor;
        }
        this.form.patchValue({
          fontSize: parseInt(this.styles.fontSize as string, 10) || PEB_DEFAULT_FONT_SIZE,
          hasBorder: !!this.styles.borderColor,
          borderRadius: this.styles.borderRadius || null,
          borderWidth:
            this.styles.borderWidth
              ? (parseInt(this.styles.borderWidth as string, 10))
              : 1,
          borderColor: this.styles.borderColor,
          color: this.styles.color || null,
          borderStyle: this.styles.borderStyle,
          fontFamily: this.styles.fontFamily || 'Roboto',
          hasShadow: this.styles.boxShadow && this.styles.boxShadow !== 'inherit',
          shadowSpread: this.getBoxShadow() ? this.getBoxShadow()[4] : 0,
          shadowBlur: this.getBoxShadow() ? this.getBoxShadow()[3] : 0,
          linkType: this.element.data?.action?.type ?? 'none',
          linkToPage: this.element.data?.action?.type === PebInteractionType.NavigateInternal
            ? this.element.data.action.payload
            : '',
          linkCustom: this.element.data?.action?.type === PebInteractionType.NavigateExternal
            ? this.element.data.action.payload
            : '',
        });
      }),
    );
  }

  get changesButtonForm$() {
    return merge(
      this.form.get('hasShadow').valueChanges.pipe(
        map((hasShadow) => {
          return { boxShadow: hasShadow ? this.changeShadow().boxShadow : 'inherit' };
        }),
      ),
      this.form.get('fontFamily').valueChanges.pipe(
        map(fontFamily => ({ fontFamily })),
      ),
      this.form.get('color').valueChanges.pipe(
        map(color => ({ color })),
      ),
      this.form.get('fontStyle').valueChanges.pipe(
        map(fontStyle => fontStyle),
      ),
      this.form.get('hasBorder').valueChanges.pipe(
        filter(hasBorder => !hasBorder),
        tap(() => {
          this.form.get('borderColor').setValue(null);
          this.form.get('borderStyle').setValue(null);
          this.form.get('borderWidth').setValue(1);
        }),
      ),
      this.form.get('borderStyle').valueChanges.pipe(
        map(borderStyle => ({ borderStyle })),
      ),
      this.form.get('borderRadius').valueChanges.pipe(
        map(borderRadius => ({ borderRadius })),
      ),
      this.form.get('borderColor').valueChanges.pipe(
        map(borderColor => ({ borderColor })),
      ),
      this.form.get('borderWidth').valueChanges.pipe(
        map(borderWidth => ({ borderWidth })),
      ),
      this.form.get('fontSize').valueChanges.pipe(
        map(fontSize => ({ fontSize })),
      ),
      this.form.get('shadowSpread').valueChanges.pipe(
        map(_ => this.changeShadow()),
      ),
      this.form.get('shadowBlur').valueChanges.pipe(
        map(_ => this.changeShadow()),
      ),
      this.form.get('paragraphStyle').valueChanges.pipe(
        map(fontSize => ({ fontSize })),
      ),
      this.form.get('linkCustom').valueChanges.pipe(
        tap(event => this.linkHandler(PebInteractionType.NavigateExternal, event)),
      ),
      this.form.get('linkType').valueChanges.pipe(
        tap((linkType) => {
          switch (linkType) {
            case PebInteractionType.NavigateInternal:
              this.linkHandler(PebInteractionType.NavigateInternal, this.form.get('linkToPage').value);
              break;
            case PebInteractionType.NavigateExternal:
              this.linkHandler(PebInteractionType.NavigateExternal, this.form.get('linkCustom').value);
              break;
            case 'none':
              this.linkHandler();
              break;
          }
        }),
      ),
    ).pipe(
      tap((style) => {
        if (typeof style !== 'object') {
          return;
        }
        this.changeStyle.next(style);
        this.changeStyleFinal.next(style);
      }),
    );
  }
  linkHandler(type = null, payload = null) {
    const action = type ? { type, payload } : null;
    const element = { data: { action } };

    this.changeElement.next(element);
    this.changeElementFinal.next(element);
  }

  getBoxShadow() {
    const boxShadow = this.styles.boxShadow;
    if (boxShadow && typeof boxShadow === 'string' && boxShadow !== 'inherit') {
      const shadowArray = boxShadow.split(/\s+/);
      const noPx = shadowArray.map(res => res.replace('px', ''));
      return noPx;
    }

    return ['rgba(0,0,0,0.7)', 0, 2, 4, 1];
  }

  changeShadow() {
    if (!this.form.get('hasShadow').value) {
      return { boxShadow: 'inherit' };
    }

    const shadow = this.getBoxShadow();
    shadow[3] = this.form.get('shadowBlur').value;
    shadow[4] = this.form.get('shadowSpread').value;
    const boxShadow = shadow
      .map((res, i) => (i === 0 ? res : parseInt(res as string, 10)))
      .join(' ');

    return { boxShadow };
  }
}
