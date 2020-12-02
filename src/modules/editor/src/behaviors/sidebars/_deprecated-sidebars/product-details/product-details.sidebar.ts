import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { map, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';

import { PebElementDef, PebElementStyles } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { AngleFlipHelper } from '../shared/helpers/angle-flip.helper';
import { defaultColors } from '../shared/color-palette/default-colors';
import { fontOptions } from '../shared/text/text-style.constants';
import { SidebarBasic } from '../sidebar.basic';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PageSidebarDefaultOptions } from '../sidebar.utils';

@Component({
  selector: 'peb-editor-product-details-sidebar',
  templateUrl: 'product-details.sidebar.html',
  styleUrls: ['./product-details.sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorProductDetailsSidebarComponent extends SidebarBasic
  implements OnInit {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() component: PebEditorElement;
  @Output() changeStyle = new EventEmitter<any>();

  gridColors = defaultColors;
  fontOptions = fontOptions;
  defaultFontFamily = 'Roboto';
  defaultFontSize = 12;
  defaultTextColor = '#000000';
  defaultButtonTextColor = '#FFFFFF';

  styleForm: FormGroup = this.formBuilder.group({
    hasBackground: false,
    hasButtonBackground: false,
    backgroundColor: '',
    buttonBackgroundColor: '',
    fontSize: 0,
    color: '',
    buttonColor: '',
    fontFamily: '',
    fontWeight: '',
    fontStyle: '',
    textDecoration: '',
    buttonFontFamily: '',
    buttonFontWeight: '',
    buttonFontStyle: '',
    buttonTextDecoration: '',
    buttonFontSize: 0,
  });

  arrangeForm: FormGroup = this.formBuilder.group({
    size: this.formBuilder.group({
      width: 0,
      height: 0,
    }),
    position: this.formBuilder.group({
      posX: 0,
      posY: 0,
    }),
    angle: 0,
  });

  get hasBackground(): AbstractControl {
    return this.styleForm.get('hasBackground');
  }
  private hasBackground$ = this.hasBackground.valueChanges;

  get hasButtonBackground(): AbstractControl {
    return this.styleForm.get('hasButtonBackground');
  }
  private hasButtonBackground$ = this.hasButtonBackground.valueChanges;

  get backgroundColor(): AbstractControl {
    return this.styleForm.get('backgroundColor');
  }
  private backgroundColor$ = this.backgroundColor.valueChanges;

  get buttonBackgroundColor(): AbstractControl {
    return this.styleForm.get('buttonBackgroundColor');
  }
  private buttonBackgroundColor$ = this.buttonBackgroundColor.valueChanges;

  get width(): AbstractControl {
    return this.arrangeForm.get('size').get('width');
  }
  private width$ = this.width.valueChanges;

  get height(): AbstractControl {
    return this.arrangeForm.get('size').get('height');
  }
  private height$ = this.height.valueChanges;

  get posX(): AbstractControl {
    return this.arrangeForm.get('position').get('posX');
  }
  private posX$ = this.posX.valueChanges;

  get posY(): AbstractControl {
    return this.arrangeForm.get('position').get('posY');
  }
  private posY$ = this.posY.valueChanges;

  get angle(): AbstractControl {
    return this.arrangeForm.get('angle');
  }
  private angle$ = this.angle.valueChanges;

  get color(): AbstractControl {
    return this.styleForm.get('color');
  }
  private color$ = this.color.valueChanges;

  get buttonColor(): AbstractControl {
    return this.styleForm.get('buttonColor');
  }
  private buttonColor$ = this.buttonColor.valueChanges;

  get fontSize(): AbstractControl {
    return this.styleForm.get('fontSize');
  }
  private fontSize$ = this.fontSize.valueChanges;

  get fontFamily(): AbstractControl {
    return this.styleForm.get('fontFamily');
  }
  private fontFamily$ = this.fontFamily.valueChanges;

  get fontWeight(): AbstractControl {
    return this.styleForm.get('fontWeight');
  }
  private fontWeight$ = this.fontWeight.valueChanges;

  get fontStyle(): AbstractControl {
    return this.styleForm.get('fontStyle');
  }
  private fontStyle$ = this.fontStyle.valueChanges;

  get textDecoration(): AbstractControl {
    return this.styleForm.get('textDecoration');
  }
  private textDecoration$ = this.textDecoration.valueChanges;

  get buttonFontSize(): AbstractControl {
    return this.styleForm.get('buttonFontSize');
  }
  private buttonFontSize$ = this.buttonFontSize.valueChanges;

  get buttonFontFamily(): AbstractControl {
    return this.styleForm.get('buttonFontFamily');
  }
  private buttonFontFamily$ = this.buttonFontFamily.valueChanges;

  get buttonFontWeight(): AbstractControl {
    return this.styleForm.get('buttonFontWeight');
  }
  private buttonFontWeight$ = this.buttonFontWeight.valueChanges;

  get buttonFontStyle(): AbstractControl {
    return this.styleForm.get('buttonFontStyle');
  }
  private buttonFontStyle$ = this.buttonFontStyle.valueChanges;

  get buttonTextDecoration(): AbstractControl {
    return this.styleForm.get('buttonTextDecoration');
  }
  private buttonTextDecoration$ = this.buttonTextDecoration.valueChanges;

  constructor(
    private formBuilder: FormBuilder,
    private angleFlipHelper: AngleFlipHelper,
    api: PebEditorApi,
  ) {
    super(api);
  }

  ngOnInit() {
    this.initStyleFrom();
    this.initArrangeForm();

    merge(
      ...this.passStyleFormChangesToOutput,
      ...this.passArrangeFormChangesToOutput,
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe();
  }

  private initStyleFrom() {
    this.styleForm.patchValue({
      hasBackground: !!(
        this.styles.backgroundColor &&
        this.styles.backgroundColor !== 'transparent'
      ),
      hasButtonBackground: !!(
        this.styles.buttonBackgroundColor &&
        this.styles.tonBackgroundColor !== 'transparent'
      ),
      backgroundColor: this.styles.backgroundColor,
      buttonBackgroundColor: this.styles.buttonBackgroundColor,
      color:
        this.styles.color === undefined
          ? this.defaultTextColor
          : this.styles.color,
      fontSize:
        this.styles.fontSize === undefined
          ? this.defaultFontSize
          : this.styles.fontSize,
      fontFamily: this.fontOptions
        .find(opt => opt.name === (this.styles.fontFamily || this.defaultFontFamily)),
      textDecoration: this.styles.textDecoration,
      fontWeight: this.styles.fontWeight,
      fontStyle: this.styles.fontStyle,
      buttonColor:
        this.styles.buttonColor === undefined
          ? this.defaultButtonTextColor
          : this.styles.buttonColor,
      buttonFontFamily: this.fontOptions
        .find(opt => opt.name === (this.styles.buttonFontFamily || this.defaultFontFamily)),
      buttonFontWeight: this.styles.buttonFontWeight,
      buttonFontStyle: this.styles.buttonFontStyle,
      buttonTextDecoration: this.styles.buttonTextDecoration,
      buttonFontSize:
        this.styles.buttonFontSize === undefined
          ? this.defaultFontSize
          : this.styles.buttonFontSize,
    });
  }

  private initArrangeForm() {
    const angle =
      typeof this.styles.transform === 'string'
        ? this.styles.transform
            .split('')
            .map(parseInt)
            .filter(r => !isNaN(r))
            .join('')
        : '';

    this.arrangeForm.patchValue({
      size: {
        width: this.styles.width || 0,
        height: this.styles.height || 0,
      },
      position: {
        posX: this.styles.left || 0,
        posY: this.styles.top || 0,
      },
      angle: angle || 0,
    });
  }

  private get passStyleFormChangesToOutput(): Observable<any>[] {
    return [
      this.hasBackground$.pipe(
        tap((hasBackground: boolean) => {
          const color = hasBackground
            ? this.component.background.form.get('bgColor').value || PageSidebarDefaultOptions.BgColor
            : 'transparent';
          this.component.background.form.get('bgColor').patchValue(color);
        }),
      ),
      this.backgroundColor$.pipe(
        tap((backgroundColor) => {
          if (!this.hasBackground.value) {
            this.hasBackground.patchValue(true);
          }
          this.changeStyle.emit({ backgroundColor });
        }),
      ),
      this.hasButtonBackground$.pipe(
        tap((hasBackground: boolean) =>
          this.changeStyle.emit({
            buttonBackgroundColor: hasBackground
              ? this.buttonBackgroundColor.value || '#000'
              : 'transparent',
          }),
        ),
      ),
      this.buttonBackgroundColor$.pipe(
        tap(buttonBackgroundColor =>
          this.changeStyle.emit({ buttonBackgroundColor }),
        ),
      ),
      this.color$.pipe(tap(color => this.changeStyle.emit({ color }))),
      this.fontSize$.pipe(tap(fontSize => this.changeStyle.emit({ fontSize }))),
      this.fontFamily$.pipe(
        tap(({ name }) => (
          this.changeStyle.emit({
            fontFamily: name,
          })
        )),
      ),
      this.fontWeight$.pipe(
        tap(fontWeight => this.changeStyle.emit({ fontWeight })),
      ),
      this.fontStyle$.pipe(
        tap(fontStyle => this.changeStyle.emit({ fontStyle })),
      ),
      this.textDecoration$.pipe(
        tap(textDecoration => this.changeStyle.emit({ textDecoration })),
      ),
      this.buttonColor$.pipe(
        tap(buttonColor => this.changeStyle.emit({ buttonColor })),
      ),
      this.buttonFontFamily$.pipe(
        tap(({ name }) => (
          this.changeStyle.emit({
            buttonFontFamily: name,
          })
        )),
      ),
      this.buttonFontWeight$.pipe(
        tap(buttonFontWeight => this.changeStyle.emit({ buttonFontWeight })),
      ),
      this.buttonFontStyle$.pipe(
        tap(buttonFontStyle => this.changeStyle.emit({ buttonFontStyle })),
      ),
      this.buttonTextDecoration$.pipe(
        tap(buttonTextDecoration =>
          this.changeStyle.emit({ buttonTextDecoration }),
        ),
      ),
      this.buttonFontSize$.pipe(
        tap(buttonFontSize => this.changeStyle.emit({ buttonFontSize })),
      ),
    ];
  }

  private get passArrangeFormChangesToOutput(): Observable<any>[] {
    return [
      this.height$.pipe(tap(height => this.changeStyle.next({ height }))),
      this.width$.pipe(tap(width => this.changeStyle.next({ width }))),
      this.posX$.pipe(tap(left => this.changeStyle.next({ left }))),
      this.posY$.pipe(tap(top => this.changeStyle.next({ top }))),
      this.angle$.pipe(
        map(res => `rotate(${res}deg)`),
        tap(transform => this.changeStyle.next({ transform })),
      ),
    ];
  }

  flipV() {
    const angle = this.angle.value;
    const newAngle = this.angleFlipHelper.flipV(angle);
    this.angle.patchValue(newAngle);
  }

  flipH() {
    const angle = this.angle.value;
    const newAngle = this.angleFlipHelper.flipH(angle);
    this.angle.patchValue(newAngle);
  }
}
