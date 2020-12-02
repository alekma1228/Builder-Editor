import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { PebElementDef, PebElementStyles, PebElementType } from '@pe/builder-core';
import { PebElementShape, PebShapeVariant } from '@pe/builder-renderer';
import { MediaService, PebEditorApi } from '@pe/builder-api';

import { hexToRgb, rgbToHex } from '../../../utils';
import { PebEditorElement } from '../../../renderer/editor-element';
import { SidebarBasic } from '../_deprecated-sidebars/sidebar.basic';
import { SelectOption } from '../_deprecated-sidebars/shared/select/select.component';
import { PebEditorNumberInputComponent } from '../_deprecated-sidebars/shared/number-input/number-input.component';
import { BgGradient, getGradientProperties } from '../_deprecated-sidebars/sidebar.utils';

@Component({
  selector: 'peb-editor-shapes-sidebar',
  templateUrl: 'shape.sidebar.html',
  styleUrls: [
    './shape.sidebar.scss',
    '../_deprecated-sidebars/sidebars.scss',
  ],
})
export class PebEditorShapeSidebar extends SidebarBasic implements OnInit, OnDestroy {
  PebShapeVariant = PebShapeVariant;
  readonly PebElementType = PebElementType;

  @Input() component: PebEditorElement;
  @Input() element: PebElementShape | PebElementDef;
  @Input() styles: PebElementStyles;

  @Output() changeStyle = new EventEmitter<any>();
  @Output() changeStyleFinal = new EventEmitter<any>();
  @Output() changeBgImage = new EventEmitter<string>();
  @Output() changeImageOptions = new EventEmitter<any>();
  @Output() changeImageScale = new EventEmitter<number>();
  @Output() loadingImage = new EventEmitter<boolean>();

  gridColors = ['#00a2ff', '#61d835', '#ee220d', '#f8ba00', '#ef5fa7', '#000000'];
  arrangeAlignOptions: SelectOption[] = ['Align', 'Top', 'Center', 'Bottom'].map(name => ({ name }));
  arrangeDistributeOptions: SelectOption[] = ['Distribute'].map(name => ({ name }));
  proportionRatio = 1;
  color = 'white';

  // Style tab form
  form: FormGroup;

  private activeElement: PebEditorNumberInputComponent = null;

  constructor(
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) {
    super(api, mediaService, dialog);
  }

  ngOnInit() {
    this.initStyleFrom();
    merge(
      ...this.passStyleFormChangesToOutput,
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private initStyleFrom() {
    this.form = this.formBuilder.group({
      // hasBorder: [!!this.styles.borderColor || !!this.styles.borderWidth || !!this.styles.borderStyle],
      // borderColor: [this.styles.borderColor || '#000000'],
      // borderStyle: [this.styles.borderStyle || 'solid'],
      // borderTriangleOffset: [this.styles.borderOffset || 0],
      // borderWidth: [this.styles.borderWidth !== undefined && this.styles.borderWidth !== null
      //   ? this.styles.borderWidth
      //   : 1],
      hasShadow: [!!this.styles.shadow],
      shadowBlur: [this.getShadowValuesFromString(this.styles.shadow as string).blur || 5],
      shadowColor: [this.getShadowValuesFromString(this.styles.shadow as string).color || '#000000'],
      shadowOffset: [this.getShadowValuesFromString(this.styles.shadow as string).offset || 10],
      shadowOpacity: [this.getShadowValuesFromString(this.styles.shadow as string).opacity || 100],
      shadowAngle: [
        this.getShadowValuesFromString(this.styles.shadow as string).angle || 315,
        [Validators.min(0), Validators.max(360)],
      ],
      opacity: [this.styles.opacity !== undefined ? Math.round(+this.styles.opacity * 100) : 100],
    });
  }

  private get passStyleFormChangesToOutput(): Observable<any>[] {
    return [
      // this.form.get('hasBorder').valueChanges.pipe(
      //   tap(hasBorder => {
      //     if (hasBorder) {
      //       this.changeStyle.emit({
      //         borderColor: this.form.value.borderColor,
      //         borderStyle: this.form.value.borderStyle,
      //         borderWidth: this.form.value.borderWidth,
      //       });
      //     } else {
      //       this.changeStyle.emit({
      //         borderColor: null,
      //         borderStyle: null,
      //         borderWidth: null,
      //       });
      //     }
      //   }),
      // ),
      // this.form.get('borderStyle').valueChanges.pipe(
      //   tap(borderStyle => this.changeStyle.emit({ borderStyle })),
      // ),
      // this.form.get('borderTriangleOffset').valueChanges.pipe(
      //   tap(borderOffset => this.changeStyle.emit({ borderOffset })),
      // ),
      // this.form.get('borderWidth').valueChanges.pipe(
      //   tap(borderWidth => this.changeStyle.emit({ borderWidth })),
      // ),
      // this.form.get('borderColor').valueChanges.pipe(
      //   tap(borderColor => this.changeStyle.emit({ borderColor })),
      // ),
      this.form.get('hasShadow').valueChanges.pipe(
        tap((value: boolean) => this.changeStyle.emit({ shadow: value ? this.getShadowString({}) : null })),
      ),
      this.form.get('shadowBlur').valueChanges.pipe(
        tap(blur => this.changeStyle.emit({ shadow: this.getShadowString({ blur }) })),
      ),
      this.form.get('shadowColor').valueChanges.pipe(
        tap(color => this.changeStyle.emit({ shadow: this.getShadowString({ color }) })),
      ),
      this.form.get('shadowOffset').valueChanges.pipe(
        tap(offset => this.changeStyle.emit({ shadow: this.getShadowString({ offset }) })),
      ),
      this.form.get('shadowOpacity').valueChanges.pipe(
        tap(opacity => this.changeStyle.emit({ shadow: this.getShadowString({ opacity }) })),
      ),
      this.form.get('shadowAngle').valueChanges.pipe(
        tap(angle => this.changeStyle.emit({ shadow: this.getShadowString({ angle }) })),
      ),
      this.form.get('opacity').valueChanges.pipe(
        map(opacity => opacity / 100),
        tap(opacity => this.changeStyle.emit({ opacity })),
      ),
    ];
  }

  private getShadowString(values: any) {
    if (!this.form.value.hasShadow) {
      return '';
    }
    const blur = (values.blur || this.form.value.shadowBlur) + 'pt';
    const color = hexToRgb(values.color || this.form.value.shadowColor);
    const offset = values.offset || this.form.value.shadowOffset;
    const angle = values.angle !== undefined ? values.angle : this.form.value.shadowAngle;
    const offsetX = (offset * Math.cos(angle * Math.PI / 180)) + 'pt';
    const offsetY = (offset * -Math.sin(angle * Math.PI / 180)) + 'pt';
    const opacity = (values.opacity !== undefined ? values.opacity : this.form.value.shadowOpacity) / 100;
    return `drop-shadow(${offsetX} ${offsetY} ${blur} rgba(${color.r},${color.g},${color.b},${opacity}))`;
  }

  private getShadowValuesFromString(shadowString: string) {
    if (!shadowString) {
      return {};
    }
    shadowString = shadowString.replace('drop-shadow(', '').replace('))', '');
    const shadowValuesArray = shadowString.split(' ');
    const shadowValuesColors = shadowValuesArray[3].replace('rgba(', '').split(',');
    const offsetX = +shadowValuesArray[0].replace('pt', '');
    const offsetY = +shadowValuesArray[1].replace('pt', '');
    const angle = Math.round(Math.atan2(-offsetY, offsetX) * (180 / Math.PI));
    return {
      blur: shadowValuesArray[2].replace('pt', ''),
      offset: Math.round(Math.sqrt(offsetX * offsetX + offsetY * offsetY)),
      color: rgbToHex(+shadowValuesColors[0], +shadowValuesColors[1], +shadowValuesColors[2]),
      opacity: Math.round(+(shadowValuesColors[3]) * 100),
      angle: angle >= 0 ? angle : angle + 360,
    };
  }
}
