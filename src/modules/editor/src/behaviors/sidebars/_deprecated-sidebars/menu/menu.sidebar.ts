import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { PebElementDef, PebElementStyles, pebGenerateId, PebShopRoute, PebShopThemeSnapshot, PebPageType } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { PebEditorStore } from '../../../../services/editor.store';
import {
  characterStyleOptions,
  fontOptions,
  fontStyleOptions,
  paragraphStyleOptions,
  spacingOptions,
} from '../shared/text/text-style.constants';
import { SelectOption } from '../shared/select/select.component';
import { SidebarBasic } from '../sidebar.basic';

enum MenuTabs {
  Options = 'Options',
  Style = 'Style',
  Arrange = 'Arrange',
}

@Component({
  selector: 'peb-editor-menu-sidebar-old',
  templateUrl: 'menu.sidebar.html',
  styleUrls: [
    './menu.sidebar.scss',
    '../sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMenuSidebarComponentOld extends SidebarBasic implements OnInit, OnDestroy {
  @Input() element: PebElementDef;

  @Input() styles: PebElementStyles;

  @Output() changeStyle = new EventEmitter<any>();

  @Output() changeData = new EventEmitter<any>();

  fontOptions: SelectOption[] = fontOptions;
  fontStyleOptions: SelectOption[] = fontStyleOptions;
  spacingOptions: SelectOption[] = spacingOptions;
  characterStyleOptions: SelectOption[] = characterStyleOptions;
  paragraphStyleOptions: SelectOption[] = paragraphStyleOptions;
  borderOptions: SelectOption[] = ['Line', 'Picture Frame'].map(name => ({
    name,
  }));
  fillOptions: SelectOption[] = ['Color Fill', 'Gradient Fill'].map(name => ({
    name,
  }));

  range: any = 80;
  color: string;
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
  columns = 3;
  rows = 2;

  readonly MenuTabs: typeof MenuTabs = MenuTabs;

  private navbarForm = this.formBuilder.group({
    linkToPage: '',
    fields: this.formBuilder.array([]),
    borderWidth: 0,
    fontSize: 0,
    borderRadius: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    angle: 0,
    linkType: '',
    borderStyle: '',
    borderStyleType: '',
    backgroundFill: '',
    fontFamily: '',
    fontStyle: '',
    paragraphStyle: '',
  });

  arrangeForm = this.formBuilder.group({
    size: this.formBuilder.group({
      width: 0,
      height: 0,
      constrainProportions: false,
    }),
    // position: this.formBuilder.group({
    //   posX: 0,
    //   posY: 0,
    // }),
    // angle: 0,
  });

  get borderWidthControl() {
    return this.navbarForm.get('borderWidth');
  }
  private borderWidthControl$ = this.borderWidthControl.valueChanges;

  get backgroundFillControl() {
    return this.navbarForm.get('backgroundFill');
  }
  private backgroundFillControl$ = this.backgroundFillControl.valueChanges;

  get fontSizeControl() {
    return this.navbarForm.get('fontSize');
  }
  private fontSizeControl$ = this.fontSizeControl.valueChanges;

  get borderRadiusControl() {
    return this.navbarForm.get('borderRadius');
  }
  private borderRadiusControl$ = this.borderRadiusControl.valueChanges;

  get shadowBlurControl() {
    return this.navbarForm.get('shadowBlur');
  }
  private shadowBlurControl$ = this.shadowBlurControl.valueChanges;

  get shadowSpreadControl() {
    return this.navbarForm.get('shadowSpread');
  }
  private shadowSpreadControl$ = this.shadowSpreadControl.valueChanges;

  get navbarHeightControl() {
    return this.arrangeForm.get('size.height');
  }
  private navbarHeight$ = this.navbarHeightControl.valueChanges;

  get navbarWidthControl() {
    return this.arrangeForm.get('size.width');
  }
  private navbarWidth$ = this.navbarWidthControl.valueChanges;

  get navbarPositionXControl() {
    return this.arrangeForm.get('position.posX');
  }
  // private navbarPositionX$ = this.navbarPositionXControl.valueChanges;

  get navbarPositionYControl() {
    return this.arrangeForm.get('position.posY');
  }
  // private navbarPositionY$ = this.navbarPositionYControl.valueChanges;

  get navbarConstrainControl() {
    return this.arrangeForm.get('size.constrainProportions');
  }
  private navbarConstrain$ = this.navbarConstrainControl.valueChanges;

  get navbarRotateControl() {
    return this.arrangeForm.get('angle');
  }
  // private navbarRotate$ = this.navbarRotateControl.valueChanges;

  get borderStyleControl() {
    return this.navbarForm.get('borderStyle');
  }
  private borderStyleControl$ = this.borderStyleControl.valueChanges;

  get borderStyleTypeControl() {
    return this.navbarForm.get('borderStyleType');
  }
  private borderStyleTypeControl$ = this.borderStyleControl.valueChanges;

  get fontFamilyControl() {
    return this.navbarForm.get('fontFamily');
  }
  private fontFamilyControl$ = this.fontFamilyControl.valueChanges;

  get fontStyleControl() {
    return this.navbarForm.get('fontStyle');
  }
  private fontStyleControl$ = this.fontStyleControl.valueChanges;

  get paragraphStyleControl() {
    return this.navbarForm.get('paragraphStyle');
  }
  private paragraphStyle$ = this.paragraphStyleControl.valueChanges;

  get linkTypeControl() {
    return this.navbarForm.get('linkType');
  }
  private linkTypeControl$ = this.linkTypeControl.valueChanges;

  selectedField: FormGroup;

  get linkToPageControl() {
    return this.navbarForm.get('linkToPage');
  }
  linkToPageControl$ = this.linkToPageControl.valueChanges;

  get fields() {
    return this.navbarForm.get('fields') as FormArray;
  }
  fields$ = this.fields.valueChanges;

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

  constructor(
    private store: PebEditorStore,
    private formBuilder: FormBuilder,
    api: PebEditorApi,
  ) {
    super(api)
  }

  ngOnInit() {
    this.element?.data.routes.forEach(({title, route, routeId}, i) => {
      this.fields.push(this.formBuilder.group({ title, routeId: route ?? routeId ?? '' }));
    });
    this.initStyles();
    this.fields.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(300),
    ).subscribe(fields => {
      this.changeData.next({
        ...this.element.data,
        routes: fields.map(({ title, route, routeId, id }) => ({
          title,
          routeId: route ?? routeId ?? '',
          id,
        })),
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  addNewField() {
    this.fields.push(
      this.formBuilder.group({
        routeId: '',
        id: pebGenerateId(),
        title: `${this.fields.length + 1} Page`,
      }),
    );
    this.selectedField = this.fields.controls[this.fields.controls.length - 1] as FormGroup;
  }

  deleteField() {
    const index = this.fields.controls.findIndex(field => field === this.selectedField);
    this.fields.removeAt(index);
  }

  isBorderActive(): boolean {
    return !!this.styles.borderColor || !!this.styles.borderWidth || !!this.styles.borderStyle;
  }

  characterStyleHandler(style) {
    if (
      this.styles.fontStyle === style.name?.toLowerCase() ||
      this.styles.fontWeight === style.name?.toLowerCase() ||
      this.styles.textDecoration === style.name?.toLowerCase()
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
  canEditBorder(isChecked: boolean) {
    if (!isChecked) {
      this.changeStyle.next({ borderColor: null });
      this.changeStyle.next({ borderStyle: null });
      this.changeStyle.next({ borderWidth: null });
    } else {
      this.changeStyle.next({ borderColor: '#fff' });
      this.changeStyle.next({ borderStyle: 'solid' });
      this.borderWidthControl$
        .pipe(
          tap(borderWidth => this.changeStyle.next({ borderWidth })),
          takeUntil(this.destroyed$),
        )
        .subscribe();
    }
  }

  private changeMenuStyle() {
    return merge(
      this.navbarHeight$.pipe(tap(height => this.changeStyle.next({ height }))),
      this.navbarWidth$.pipe(tap(width => this.changeStyle.next({ width }))),
      // this.navbarPositionX$.pipe(tap(left => this.changeStyle.next({ left }))),
      // this.navbarPositionY$.pipe(tap(top => this.changeStyle.next({ top }))),
      // this.navbarRotate$.pipe(
      //   map(res => `rotate(${res}deg)`),
      //   tap(transform => this.changeStyle.next({ transform })),
      // ),
      this.fontFamilyControl$.pipe(tap(fontFamily => this.changeStyle.next({ fontFamily: fontFamily.name }))),
      this.borderStyleControl$.pipe(tap(value => this.changeStyle.next({ borderStyle: value }))),
      this.borderRadiusControl$.pipe(tap(borderRadius => this.changeStyle.next({ borderRadius }))),
      this.borderWidthControl$.pipe(tap(borderWidth => this.changeStyle.next({ borderWidth }))),
      this.fontSizeControl$.pipe(tap(fontSize => this.changeStyle.next({ fontSize }))),
      this.paragraphStyle$.pipe(tap(fontSize => this.changeStyle.next({ fontSize: fontSize.value }))),

      this.fontStyleControl$.pipe(tap(fontStyle => this.characterStyleHandler(fontStyle))),
      this.shadowSpreadControl$.pipe(tap(res => this.changeShadowSpread(res))),
      this.shadowBlurControl$.pipe(tap(res => this.changeShadowBlur(res))),
    ).pipe(takeUntil(this.destroyed$));
  }

  onPageSelected() {}

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

  getBoxShadow() {
    const boxShadow = this.styles.boxShadow;
    if (boxShadow && typeof boxShadow === 'string') {
      const shadowArray = boxShadow.split(/\s+/);
      const noPx = shadowArray.map(res => res.replace('px', ''));
      return noPx;
    }
  }

  changeBoxShadowHandler(isChecked) {
    const boxShadow = '#00000070 0px 2px 4px 1px';
    isChecked ? this.changeStyle.next({ boxShadow }) : this.changeStyle.next({ boxShadow: null });
  }

  changeShadowBlur(unit: string) {
    if (this.getBoxShadow()) {
      const shadowCopy = [...this.getBoxShadow()];
      shadowCopy[3] = unit;
      const withPx = shadowCopy.map((res, i) => (i === 0 ? res : res + 'px'));
      this.changeStyle.emit({ boxShadow: withPx.join(' ') });
    }
  }

  changeShadowSpread(unit: string) {
    if (this.getBoxShadow()) {
      const shadowCopy = [...this.getBoxShadow()];
      shadowCopy[4] = unit;
      const withPx = shadowCopy.map((res, i) => (i === 0 ? res : res + 'px'));
      this.changeStyle.emit({ boxShadow: withPx.join(' ') });
    }
  }

  flipV(): void {
    const normalizedAngle = this.normalizeAngle(this.navbarForm.get('angle').value);
    let newAngle;
    if (normalizedAngle < 90) {
      // 1 quarter
      newAngle = ((normalizedAngle * (Math.PI / 180) + 1.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle > 90 && normalizedAngle < 180) {
      // 2 quarter
      newAngle = ((normalizedAngle * (Math.PI / 180) + 0.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle > 180 && normalizedAngle < 270) {
      // 3 quarter
      newAngle = ((normalizedAngle * (Math.PI / 180) - 0.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle > 270 && normalizedAngle < 360) {
      // 4 quarter
      newAngle = ((normalizedAngle * (Math.PI / 180) - 1.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle === 90) {
      newAngle = 270;
    } else if (normalizedAngle === 270) {
      newAngle = 90;
    } else {
      newAngle = normalizedAngle;
    }
    this.arrangeForm.get('angle').patchValue(newAngle.toFixed(0));
  }

  flipH(): void {
    const normalizedAngle = this.normalizeAngle(this.navbarForm.get('angle').value);
    let newAngle;
    if (normalizedAngle < 90 || (normalizedAngle > 180 && normalizedAngle < 270)) {
      // 1, 3 quarter
      newAngle = ((normalizedAngle * (Math.PI / 180) + 0.5 * Math.PI) * 180) / Math.PI;
    } else if ((normalizedAngle > 90 && normalizedAngle < 180) || (normalizedAngle > 270 && normalizedAngle < 360)) {
      // 2, 4quarter
      newAngle = ((normalizedAngle * (Math.PI / 180) - 0.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle === 180) {
      newAngle = 0;
    } else if (normalizedAngle === 0) {
      newAngle = 180;
    } else {
      newAngle = normalizedAngle;
    }
    this.arrangeForm.get('angle').patchValue(newAngle.toFixed(0));
  }

  normalizeAngle(angle: number) {
    let newAngle = angle;
    while (newAngle <= -360) {
      newAngle += 360;
    }
    while (newAngle > 360) {
      newAngle -= 360;
    }
    return newAngle;
  }

  initStyles() {
    this.setInitialFontSize();
    let angle = '';
    if (typeof this.styles.transform === 'string') {
      angle = this.styles.transform
        .split('')
        .map(parseInt)
        .filter(r => !isNaN(r))
        .join('');
    }
    this.navbarForm.patchValue({
      borderRadius: this.styles.borderRadius,
      borderWidth: this.styles.borderWidth,
      shadowSpread: this.getBoxShadow() ? this.getBoxShadow()[4] : 0,
      shadowBlur: this.getBoxShadow() ? this.getBoxShadow()[3] : 0,
    });
    this.borderRadiusControl.patchValue(this.styles.borderRadius);
    this.arrangeForm.patchValue({
      position: {
        posX: this.styles.left || 0,
        posY: this.styles.top || 0,
      },
      size: {
        width: this.styles.width || 0,
        height: this.styles.height || 0,
        constrainProportions: false,
      },
      angle,
    });
    this.backgroundColor = this.styles.backgroundColor as string;
    this.color = this.styles.color as string;
    this.iconColor = this.styles.iconColor as string;
    this.changeMenuStyle().subscribe();
  }
}
