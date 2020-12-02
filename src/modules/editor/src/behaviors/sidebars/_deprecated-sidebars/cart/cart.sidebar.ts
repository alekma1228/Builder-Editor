import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebElementDef, PebElementStyles } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { PebEditorStore } from '../../../../services/editor.store';
import { SelectOption } from '../shared/select/select.component';
import {
  characterStyleOptions,
  fontOptions,
  fontStyleOptions,
  paragraphStyleOptions,
  spacingOptions,
} from '../shared/text/text-style.constants';
import { AngleFlipHelper } from '../shared/helpers/angle-flip.helper';
import { defaultColors } from '../shared/color-palette/default-colors';
import { SidebarBasic } from '../sidebar.basic';
import { fillOptions } from './cart.constant';
import { PebEditorElement } from '../../../../renderer/editor-element';

export enum FontCharacterStyleConstants {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  STRIKE = 'strike',
}
export enum FlexConstants {
  FLEX_START = 'flex-start',
  CENTER = 'center',
  FLEX_END = 'flex-end',
  JUSTIFY = 'justify',
  BETWEEN = 'space-between',
}

export enum FillOptions {
  ColorFill = 'Color fill',
  Gradient = 'Gradient fill',
}

@Component({
  selector: 'peb-editor-cart-sidebar',
  templateUrl: './cart.sidebar.html',
  styleUrls: [
    './cart.sidebar.scss',
    '../sidebars.scss',
  ],
})
export class PebEditorCartSideBarComponent extends SidebarBasic implements OnInit {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() component: PebEditorElement;

  @Output() changeData = new EventEmitter<any>();
  @Output() changeStyle = new EventEmitter<PebElementStyles>();

  destroy$ = new Subject<boolean>();
  allowBackgroundChange = true;

  constructor(
    public store: PebEditorStore,
    private angleFlipHelper: AngleFlipHelper,
    public api: PebEditorApi,
  ) {
    super(api);
  }

  fontOptions: SelectOption[] = fontOptions;
  fontStyleOptions: SelectOption[] = fontStyleOptions;
  spacingOptions: SelectOption[] = spacingOptions;
  characterStyleOptions: SelectOption[] = characterStyleOptions;
  paragraphStyleOptions: SelectOption[] = paragraphStyleOptions;

  borderOptions: SelectOption[] = ['Line'].map(name => ({
    name,
  }));

  characterStyle = FontCharacterStyleConstants;
  flexConstants = FlexConstants;
  fillOptionsEnum = FillOptions;
  defaultCartColor = 'black';
  defaultBadgeColor = 'red';
  defaultBadgeTextColor = 'white';
  gridColors = defaultColors;

  range: any = 80;
  color: string;
  badgeColor: string;
  badgeTextColor: string;
  borderColor: string;

  private defaultCartHeight = 70;
  private defaultCartWidth = 65;

  form = new FormGroup({
    borderWidth: new FormControl(0),
    fontSize: new FormControl(0),
    shadowBlur: new FormControl(0),
    shadowSpread: new FormControl(0),
    angle: new FormControl(0),
    borderStyle: new FormControl(),
    borderStyleType: new FormControl(),
    backgroundFill: new FormControl(FillOptions.ColorFill),
    fontFamily: new FormControl(),
    fontStyle: new FormControl(),
    paragraphStyle: new FormControl(),
    spacing: new FormControl(),
    allowShadow: new FormControl(false),
    allowBorder: new FormControl(false),
  });

  arrangeForm = new FormGroup({
    size: new FormGroup({
      width: new FormControl(0),
      height: new FormControl(0),
      constrainProportions: new FormControl(false),
    }),
    // position: new FormGroup({
    //   posX: new FormControl(0),
    //   posY: new FormControl(0),
    // }),
    // angle: new FormControl(0),
  });

  readonly backgroundFillOptions = fillOptions;

  get borderWidthControl() {
    return this.form.get('borderWidth');
  }
  private borderWidthControl$ = this.borderWidthControl.valueChanges;

  get backgroundFillControl() {
    return this.form.get('backgroundFill');
  }
  private backgroundFillControl$ = this.backgroundFillControl.valueChanges;

  get fontSizeControl() {
    return this.form.get('fontSize');
  }
  private fontSizeControl$ = this.fontSizeControl.valueChanges;

  get shadowBlurControl() {
    return this.form.get('shadowBlur');
  }
  private shadowBlurControl$ = this.shadowBlurControl.valueChanges;

  get shadowSpreadControl() {
    return this.form.get('shadowSpread');
  }
  private shadowSpreadControl$ = this.shadowSpreadControl.valueChanges;

  get cartHeightControl() {
    return this.arrangeForm.get('size.height');
  }
  private cartHeight$ = this.cartHeightControl.valueChanges;

  get cartWidthControl() {
    return this.arrangeForm.get('size.width');
  }
  private cartWidth$ = this.cartWidthControl.valueChanges;

  get cartpositionXControl() {
    return this.arrangeForm.get('position.posX');
  }
  // private cartpositionX$ = this.cartpositionXControl.valueChanges;

  get cartpositionYControl() {
    return this.arrangeForm.get('position.posY');
  }
  // private cartpositionY$ = this.cartpositionYControl.valueChanges;

  get cartConstrainControl() {
    return this.arrangeForm.get('size.constrainProportions');
  }
  private cartConstrain$ = this.cartConstrainControl.valueChanges;

  get cartRotateControl() {
    return this.arrangeForm.get('angle');
  }
  // private cartRotate$ = this.cartRotateControl.valueChanges;

  get borderStyleControl() {
    return this.form.get('borderStyle');
  }
  private borderStyleControl$ = this.borderStyleControl.valueChanges;

  get borderStyleTypeControl() {
    return this.form.get('borderStyleType');
  }
  private borderStyleTypeControl$ = this.borderStyleControl.valueChanges;

  get fontFamilyControl() {
    return this.form.get('fontFamily');
  }
  private fontFamilyControl$ = this.fontFamilyControl.valueChanges;

  get fontStyleControl() {
    return this.form.get('fontStyle');
  }
  private fontStyleControl$ = this.fontStyleControl.valueChanges;

  get paragraphStyleControl() {
    return this.form.get('paragraphStyle');
  }
  private paragraphStyle$ = this.paragraphStyleControl.valueChanges;

  get spacingControl() {
    return this.form.get('spacing');
  }

  get allowBorderControl() {
    return this.form.get('allowBorder');
  }
  private allowBorderControl$ = this.allowBorderControl.valueChanges;

  get allowShadowControl() {
    return this.form.get('allowShadow');
  }
  private allowShadowControl$ = this.allowShadowControl.valueChanges;

  fillOptions: FillOptions[] = [FillOptions.ColorFill, FillOptions.Gradient];

  isBorderActive(): boolean {
    return (
      !!this.styles.borderColor ||
      !!this.styles.borderWidth ||
      !!this.styles.borderStyle
    );
  }

  characterStyleHandler(style) {
    if (
      this.styles.fontStyle === style.name.toLowerCase() ||
      this.styles.fontWeight === style.name.toLowerCase() ||
      this.styles.textDecoration === style.name.toLowerCase()
    ) {
      return;
    }
    const name = style.name;
    switch (name) {
      case 'Italic':
        this.changeStyle.next({ fontStyle: 'italic' });
        break;
      case 'Underline':
        this.changeStyle.next({ textDecoration: 'underline' });
        break;
      case 'Red Bold':
        if (this.styles.fontWeight !== 'bold') {
          this.changeStyle.next({ fontWeight: 'bold' });
        }
        this.changeStyle.next({ color: 'red' });
        break;
      case 'Bold Italic':
        if (this.styles.fontWeight !== 'bold') {
          this.changeStyle.next({ fontWeight: 'bold' });
        }
        if (this.styles.fontStyle !== 'italic') {
          this.changeStyle.next({ fontStyle: 'italic' });
        }
        break;
      case 'Bold':
        this.changeStyle.next({ fontWeight: 'bold' });
        break;
      case 'Regular':
        if (this.styles.fontWeight !== 'regular') {
          this.changeStyle.next({ fontWeight: 'normal' });
        }
        break;
      default:
        this.changeStyle.next({ color: null });
    }
  }

  changeCartStyle() {
    return merge(
      this.fontFamilyControl$.pipe(
        tap(fontFamily =>
          this.changeStyle.next({ fontFamily: fontFamily.name }),
        ),
      ),
      this.fontStyleControl$.pipe(
        tap(fontStyle => this.characterStyleHandler(fontStyle)),
      ),
      this.borderStyleControl$.pipe(
        tap(value => this.changeStyle.next({ borderStyle: value })),
      ),
      this.borderWidthControl$.pipe(
        tap(borderWidth => this.changeStyle.next({ borderWidth })),
      ),
      this.fontSizeControl$.pipe(
        tap(fontSize => this.changeStyle.next({ fontSize })),
      ),
      this.shadowBlurControl$.pipe(tap(res => this.changeShadowBlur(res))),
      this.paragraphStyle$.pipe(
        tap(fontSize => this.changeStyle.next({ fontSize: fontSize.value })),
      ),
      this.allowBorderControl$.pipe(
        tap(value =>
          value
            ? this.changeStyle.next({
                borderWidth: this.borderWidthControl.value,
                borderStyle: this.borderStyleControl.value || 'solid',
              })
            : this.changeStyle.next({
                borderWidth: null,
                borderStyle: null,
              }),
        ),
      ),
      this.allowShadowControl$.pipe(
        tap(value => this.changeFilterShadowHandler(value)),
      ),
    ).pipe(takeUntil(this.destroy$));
  }

  setInitialFontSize() {
    const fontSize = this.styles.fontSize;
    if (typeof fontSize === 'string' && fontSize.includes('px')) {
      const withoutPx = fontSize.replace('px', '');
      this.fontSizeControl.setValue(Number.parseInt(withoutPx, 10));
    } else if (typeof fontSize === 'string') {
      this.fontSizeControl.setValue(Number.parseInt(fontSize, 10));
    } else {
      this.fontSizeControl.setValue(fontSize);
    }
  }

  getFilterShadow() {
    const filterShadow = this.styles.filterShadow;
    if (filterShadow && typeof filterShadow === 'string') {
      const shadowArray = filterShadow
        .replace(/(^.*\(|\).*$)/g, '')
        .split(/\s+/);
      const noPx = shadowArray.map(res => res.replace('px', ''));
      return noPx;
    }
  }

  changeFilterShadowHandler(isChecked: boolean) {
    const filterShadow = `drop-shadow(2px 2px 10px #00000070)`;
    isChecked
      ? this.changeStyle.next({ filterShadow })
      : this.changeStyle.next({ filterShadow: null });
  }

  changeShadowBlur(unit: string) {
    if (this.getFilterShadow()) {
      const shadowCopy = [...this.getFilterShadow()];
      shadowCopy[2] = unit;
      const withPx = shadowCopy.map((res, i) =>
        i === shadowCopy.length - 1 ? res : res + 'px',
      );
      this.changeStyle.emit({
        filterShadow: `drop-shadow(${withPx.join(' ')})`,
      });
    }
  }

  ngOnInit(): void {
    this.setInitialFontSize();
    const angle =
      typeof this.styles.transform === 'string'
        ? this.styles.transform
            .split('')
            .map(parseInt)
            .filter(r => !isNaN(r))
            .join('')
        : '';

    this.form.patchValue({
      borderWidth: this.styles.borderWidth || 0,
      borderStyle: this.styles.borderStyle || 'solid',
      border: this.styles.borderStyle || null,
      shadowBlur: this.getFilterShadow() ? this.getFilterShadow()[2] : 0,
      allowShadow: !!this.styles.filterShadow,
      allowBorder: this.isBorderActive(),
      borderStyleType: this.borderOptions[0],
    });

    this.arrangeForm.patchValue({
      position: {
        posX: this.styles.left || 0,
        posY: this.styles.top || 0,
      },
      size: {
        width: this.styles.width || this.defaultCartWidth,
        height: this.styles.height || this.defaultCartHeight,
        constrainProportions: false,
      },
      angle: angle || 0,
    });
    this.badgeColor =
      (this.styles.badgeColor as string) || this.defaultBadgeColor;
    this.badgeTextColor =
      (this.styles.badgeTextColor as string) || this.defaultBadgeTextColor;
    this.borderColor = this.styles.borderColor as string;
    this.changeCartStyle().subscribe();
  }

  flip(vertical: boolean): void {
    const angleValue = this.form.get('angle').value;
    const angle = vertical
      ? this.angleFlipHelper.flipV(angleValue)
      : this.angleFlipHelper.flipH(angleValue);
    this.arrangeForm.get('angle').patchValue(angle);
  }
}
