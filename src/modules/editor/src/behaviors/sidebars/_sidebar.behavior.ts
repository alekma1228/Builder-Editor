import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentRef, Injectable, Injector, Type } from '@angular/core';
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, pairwise, startWith, switchMap, tap, } from 'rxjs/operators';
import { isEqual } from 'lodash';

import { PebEditorApi } from '@pe/builder-api';
import { PebElementContextState, PebMediaService, PebScreen, PebShopContainer } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorState } from '../../services/editor.state';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorStore } from '../../services/editor.store';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../services/editor.behaviors';
import { Axis, PebEditorElement } from '../../renderer/editor-element';
import { hexToRgb, isBackgroundGradient, rgbToHex, toBase64 } from '../../utils';
import { ShadowStyles } from './_forms/shadow/shadow.interfaces';
import {
  BgGradient,
  FillType,
  getBgScale,
  getFillType,
  getGradientProperties,
  getSelectedOption,
  ImageSize,
  ImageSizes,
  initFillType,
  PageSidebarDefaultOptions,
} from './_deprecated-sidebars/sidebar.utils';
import { showImageSpinner } from '../_utils/sidebar.common';
import { SelectOption } from './_deprecated-sidebars/shared/select/select.component';
import { SidebarBasic } from './_deprecated-sidebars/sidebar.basic';
import { PebAbstractSidebar } from './sidebar.abstract';
import { PebBorderStyles } from '../../renderer/interfaces';
import { CategoryType, CategoryTypeOptions } from './_forms/categories/categories.form.constants';

export interface DimensionsFormValues {
  width: number;
  height: number;
  keepRation: boolean;
}

export interface ProportionDimensionsFormValues {
  width: number;
  height: number;
  constrainProportions?: boolean;
  proportionRatio?: number;
}

export interface ShadowValues {
  blur: number;
  offset: number;
  color: string;
  opacity: number;
  angle: number;
}

@Injectable({ providedIn: 'any' })
export abstract class AbstractEditElementWithSidebar<T extends SidebarBasic | PebAbstractSidebar>
  implements PebEditorBehaviourAbstract
{
  abstract logger: { log: (...args: any) => void };
  protected abstract sidebarComponent: Type<T>;

  protected editor: PebAbstractEditor = this.injector.get(PebAbstractEditor);
  protected state: PebEditorState = this.injector.get(PebEditorState);
  protected renderer: PebEditorRenderer = this.injector.get(PebEditorRenderer);
  protected store: PebEditorStore = this.injector.get(PebEditorStore);
  protected formBuilder: FormBuilder = this.injector.get(FormBuilder);
  protected events: PebEditorEvents = this.injector.get(PEB_EDITOR_EVENTS);

  protected editorApi = this.injector.get<PebEditorApi>(PebEditorApi);
  protected mediaService = this.injector.get<PebMediaService>(PebMediaService);

  readonly ImageSizes: typeof ImageSizes = ImageSizes;

  protected constructor(private injector: Injector) {
  }

  abstract init(): Observable<any>;

  /**
   *  General
   */
  protected singleElementOfTypeSelected$(): Observable<PebEditorElement> {
    return this.state.singleSelectedElement$.pipe(
      filter(Boolean),
      map(this.renderer.getElementComponent),
      filter(elCmp =>
        (this.constructor as any).elementTypes.includes(elCmp?.definition.type),
      ),
    );
  }

  protected initSidebar<P extends PebEditorElement>(elementCmp: P, instanceProps?: Partial<T>): ComponentRef<T> {
    const sidebarCmpRef = this.editor.openSidebar(this.sidebarComponent);

    Object.assign(sidebarCmpRef.instance, {
      element: elementCmp.definition,
      styles: elementCmp.styles,
      component: elementCmp,
    }, instanceProps);

    sidebarCmpRef.changeDetectorRef.detectChanges();

    return sidebarCmpRef;
  }

  /**
   *  Position
   */
  protected initPositionForm(elementCmp: PebEditorElement) {
    const elementDs = elementCmp.getAbsoluteElementRect();
    const initialValue = {
      x: elementDs.left,
      y: elementDs.top,
    };

    elementCmp.position = {
      initialValue,
      form: this.formBuilder.group({
        x: [{ value: initialValue.x, disabled: true }],
        y: [{ value: initialValue.y, disabled: true }],
      }),
      limits: {
        x: new BehaviorSubject({
          min: 0,
          max: 500,
        }),
        y: new BehaviorSubject({
          min: 0,
          max: 500,
        }),
      },
      update: () => {},
      submit: new Subject<any>(),
    };
  }

  protected handlePositionForm(elCmp: PebEditorElement): Observable<any> {
    return merge(
      elCmp.position.form.valueChanges.pipe(
        tap((evt) => this.logger.log('valuesChanges', evt)),
      ),
      elCmp.position.form.statusChanges.pipe(
        tap((evt) => this.logger.log('statusChanges', evt)),
      ),
    );
  }

  /**
   *  Dimensions
   */
  protected initDimensionsForm(elementCmp: PebEditorElement) {
    const elDef = elementCmp.definition;
    const elementDs = elementCmp.getAbsoluteElementRect();

    const initialValue = {
      width: elementDs.width,
      height: elementDs.height,
    };

    const dimensionsLimits = this.getDimensionsLimits(elementCmp);

    if (!dimensionsLimits) {
      return;
    }

    elementCmp.dimensions = {
      initialValue,
      form: this.formBuilder.group({
        width: [
          initialValue.width,
          [Validators.min(dimensionsLimits.width.min), Validators.max(dimensionsLimits.width.max)],
        ],
        height: [
          initialValue.height,
          [Validators.min(dimensionsLimits.height.min), Validators.max(dimensionsLimits.height.max)],
        ],
      }),
      limits: {
        width: new BehaviorSubject(dimensionsLimits.width),
        height: new BehaviorSubject(dimensionsLimits.height),
        // TODO: proportional
      },
      activate: this.activateDimensionsForm(elementCmp),
      update: this.updateDimensionsForm(elementCmp),
      submit: new Subject<any>(),
    };
  }

  protected activateDimensionsForm = (elementCmp: PebEditorElement) => () => {
    const elementDs = elementCmp.getAbsoluteElementRect();
    const dssLimits = {
      width: elementCmp.dimensions.limits.width.value,
      height: elementCmp.dimensions.limits.height.value,
    }

    if (elementDs.width > dssLimits.width.max || elementDs.height > dssLimits.height.max) {
      elementCmp.dimensions.form.setValue({
        width: Math.min(elementDs.width, dssLimits.width.max),
        height: Math.min(elementDs.height, dssLimits.height.max),
      }, { emitEvent: false });
    }
  }

  protected updateDimensionsForm = (elementCmp: PebEditorElement) => () => {
    const elDef = elementCmp.definition;
    const dimensionsLimits = this.getDimensionsLimits(elementCmp);
    const dssForm: FormGroup = elementCmp.dimensions.form;

    const proportionRatio = dssForm.value.width / dssForm.value.height;

    dssForm.patchValue({ proportionRatio });

    if (!dimensionsLimits) {
      return;
    }

    dssForm.controls.width.setValidators([
      Validators.min(dimensionsLimits.width.min),
      Validators.max(dimensionsLimits.width.max),
    ]);
    dssForm.controls.height.setValidators([
      Validators.min(dimensionsLimits.height.min),
      Validators.max(dimensionsLimits.height.max),
    ]);

    elementCmp.dimensions.limits.width.next(dimensionsLimits.width);
    elementCmp.dimensions.limits.height.next(dimensionsLimits.height);
  }

  protected getDimensionsLimits(elementCmp: PebEditorElement) {
    const widthMaxDimensions = elementCmp.getMaxPossibleDimensions(Axis.Horizontal);
    const heightMaxDimensions = elementCmp.getMaxPossibleDimensions(Axis.Vertical);

    if (!widthMaxDimensions || !heightMaxDimensions) {
      return;
    }

    return {
      width: {
        min: elementCmp.getMinPossibleDimensions(Axis.Horizontal),
        max: widthMaxDimensions.size,
      },
      height: {
        min: elementCmp.getMinPossibleDimensions(Axis.Vertical),
        max: heightMaxDimensions.size - heightMaxDimensions.spaceStart,
      },
    }
  }

  protected handleDimensionsForm(elCmp: PebEditorElement): Observable<any> {
    const elDef = elCmp.definition;
    const dimensions = elCmp.dimensions;

    if (!dimensions) {
      return EMPTY;
    }

    return merge(
      dimensions.form.valueChanges.pipe(
        startWith(null as DimensionsFormValues),
        distinctUntilChanged(isEqual),
        pairwise(),
        tap(([prevValue, value]: DimensionsFormValues[]) => {
          if (dimensions.form.invalid) {
            this.logger.log('Dimensions: Change: Invalid');
            return;
          }

          this.logger.log('Dimensions: Change: Valid ', dimensions.form.value);
          elCmp.styles.width = value.width;
          elCmp.styles.height = value.height;

          elCmp.applyStyles();
        }),
      ),
      dimensions.submit.pipe(
        filter(() => dimensions.form.valid && !isEqual(dimensions.initialValue, dimensions.form.value)),
        switchMap(() => {
          this.logger.log('Dimensions: Submit ', dimensions.form.value);
          elCmp.dimensions.update();
          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: { ...dimensions.form.value },
          });
        }),
      ),
    );
  }

  /**
   *  Proportion Dimensions
   */
  protected initProportionDimensionsForm(elementCmp: PebEditorElement) {
    const elDef = elementCmp.definition;
    const elementDs = elementCmp.getAbsoluteElementRect();

    const initialValue = {
      width: elementDs.width,
      height: elementDs.height,
      constrainProportions: elDef.data?.constrainProportions ? elDef.data.constrainProportions : null,
      proportionRation: elDef.data?.proportionRation ? elDef.data.proportionRation : null,
    };

    const pDimensionsLimits = this.getProportionDimensionsLimits(elementCmp);

    if (!pDimensionsLimits) {
      return;
    }

    elementCmp.proportionDimensions = {
      initialValue,
      form: this.formBuilder.group({
        width: [
          initialValue.width,
          [Validators.min(pDimensionsLimits.width.min), Validators.max(pDimensionsLimits.width.max)],
        ],
        height: [
          initialValue.height,
          [Validators.min(pDimensionsLimits.height.min), Validators.max(pDimensionsLimits.height.max)],
        ],
        constrainProportions: [
          initialValue.constrainProportions,
        ],
        proportionRatio: [
          initialValue.proportionRation,
        ]
      }),
      limits: {
        width: new BehaviorSubject(pDimensionsLimits.width),
        height: new BehaviorSubject(pDimensionsLimits.height),
      },
      activate: this.activateProportionDimensionsForm(elementCmp),
      update: this.updateProportionDimensionsForm(elementCmp),
      submit: new Subject<any>(),
    };
  }

  protected activateProportionDimensionsForm = (elementCmp: PebEditorElement) => () => {
    const elementDs = elementCmp.getAbsoluteElementRect();
    const dssLimits = {
      width: elementCmp.proportionDimensions.limits.width.value,
      height: elementCmp.proportionDimensions.limits.height.value,
    }

    if (elementDs.width > dssLimits.width.max || elementDs.height > dssLimits.height.max) {
      elementCmp.proportionDimensions.form.setValue({
        width: Math.min(elementDs.width, dssLimits.width.max),
        height: Math.min(elementDs.height, dssLimits.height.max),
      }, { emitEvent: false });
    }
  }

  protected updateProportionDimensionsForm = (elementCmp: PebEditorElement) => () => {
    const elDef = elementCmp.definition;
    const pDimensionsLimits = this.getProportionDimensionsLimits(elementCmp);
    const pDssForm: FormGroup = elementCmp.proportionDimensions.form;

    const proportionRatio = pDssForm.value.width / pDssForm.value.height;

    pDssForm.patchValue({ proportionRatio });

    if (!pDimensionsLimits) {
      return;
    }

    pDssForm.controls.width.setValidators([
      Validators.min(pDimensionsLimits.width.min),
      Validators.max(pDimensionsLimits.width.max),
    ]);
    pDssForm.controls.height.setValidators([
      Validators.min(pDimensionsLimits.height.min),
      Validators.max(pDimensionsLimits.height.max),
    ]);

    elementCmp.proportionDimensions.limits.width.next(pDimensionsLimits.width);
    elementCmp.proportionDimensions.limits.height.next(pDimensionsLimits.height);
  }

  protected getProportionDimensionsLimits(elementCmp: PebEditorElement) {
    const widthMaxDimensions = elementCmp.getMaxPossibleDimensions(Axis.Horizontal);
    const heightMaxDimensions = elementCmp.getMaxPossibleDimensions(Axis.Vertical);

    if (!widthMaxDimensions || !heightMaxDimensions) {
      return;
    }

    return {
      width: {
        min: elementCmp.getMinPossibleDimensions(Axis.Horizontal),
        max: widthMaxDimensions.size,
      },
      height: {
        min: elementCmp.getMinPossibleDimensions(Axis.Vertical),
        max: heightMaxDimensions.size - heightMaxDimensions.spaceStart,
      },
    }
  }

  protected handleProportionDimensionsForm(elCmp: PebEditorElement): Observable<any> {
    const elDef = elCmp.definition;
    const proportionDimensions = elCmp.proportionDimensions;

    if (!proportionDimensions) {
      return EMPTY;
    }

    return merge(
      proportionDimensions.form.valueChanges.pipe(
        startWith(null as ProportionDimensionsFormValues),
        distinctUntilChanged(isEqual),
        pairwise(),
        tap(([prevValue, value]: ProportionDimensionsFormValues[]) => {
          if (proportionDimensions.form.invalid) {
            this.logger.log('Proportion Dimensions: Change: Invalid');
            return;
          }

          this.logger.log('Proportion Dimensions: Change: Valid ', proportionDimensions.form.value);
          elCmp.styles.width = value.width;
          elCmp.styles.height = value.height;

          elCmp.applyStyles();
        }),
      ),
      proportionDimensions.form.get('width').valueChanges.pipe(
        tap((width) => {
          if (proportionDimensions.form.value.constrainProportions) {
            const proportionRatio = proportionDimensions.form.value.width / proportionDimensions.form.value.height;
            const height = Math.round(width / proportionRatio);
            if (height !== proportionDimensions.form.get('height').value) {
              proportionDimensions.form.patchValue({ height });
            }
          }
        }),
      ),
      proportionDimensions.form.get('height').valueChanges.pipe(
        tap((height) => {
          if (proportionDimensions.form.value.constrainProportions) {
            const proportionRatio = proportionDimensions.form.value.width / proportionDimensions.form.value.height;
            const width = Math.round(height * proportionRatio);
            if (width !== proportionDimensions.form.get('width').value) {
              proportionDimensions.form.patchValue({ width });
            }
          }
        }),
      ),
      proportionDimensions.submit.pipe(
        filter(() => proportionDimensions.form.valid &&
                     !isEqual(proportionDimensions.initialValue, proportionDimensions.form.value)),
        switchMap(() => {
          this.logger.log('Proportion Dimensions: Submit ', proportionDimensions.form.value);

          elCmp.proportionDimensions.update();

          const newStyles = {
            [elDef.id]: { ...proportionDimensions.form.value },
          };

          const nextElement = {
            ...elDef,
            data: {
              ...elDef.data,
              constrainProportions: proportionDimensions.form.value.constrainProportions,
              proportionRatio: proportionDimensions.form.value.proportionRatio,
            },
          };

          return this.store.updateElementKit(this.state.screen, nextElement, newStyles);
        }),
      ),
    );
  }



  /**
   *  Opacity
   */
  protected initOpacityForm(elementCmp: PebEditorElement) {
    const initialValue = {
      opacity: isNaN(elementCmp.styles.opacity as number)
        ? 100
        : Math.ceil(elementCmp.styles.opacity as number * 100),
    };

    elementCmp.opacity = {
      initialValue,
      form: this.formBuilder.group({
        opacity: [
          initialValue.opacity,
          [Validators.min(0), Validators.max(100)],
        ],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleOpacityForm(elementCmp: PebEditorElement): Observable<any> {
    const elDef = elementCmp.definition;
    const opacity = elementCmp.opacity;

    return merge(
      opacity.form.valueChanges.pipe(
        tap((value) => {
          if (opacity.form.invalid) {
            this.logger.log('Opacity: Change: Invalid');
            return;
          }

          this.logger.log('Opacity: Change: Valid ', opacity.form.value);
          elementCmp.styles.opacity = value.opacity / 100;

          elementCmp.applyStyles();
        }),
      ),
      opacity.submit.pipe(
        switchMap(() => {
          if (opacity.form.invalid || isEqual(opacity.initialValue, opacity.form.value)) {
            return EMPTY;
          }

          this.logger.log('Opacity: Submit ', opacity.form.value);
          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: { opacity: opacity.form.value.opacity / 100 },
          })
        }),
      ),
    );
  }

  /**
   *  Font
   */
  protected initFontForm(elementCmp: PebEditorElement) {
    const initialValue = {
      fontFamily: elementCmp.styles.fontFamily as string,
      fontWeight: elementCmp.styles.fontWeight as string,
      fontStyle: elementCmp.styles.fontStyle as string,
      textDecoration: elementCmp.styles.textDecoration as string,
      fontSize: elementCmp.styles.fontSize as number,
      color: elementCmp.styles.color as string,
    };

    elementCmp.font = {
      initialValue,
      options: {
        // TODO: create a constant
        fontFamilies: [
          { label: 'Roboto', value: 'Roboto' },
          { label: 'Montserrat', value: 'Montserrat' },
          { label: 'PT Sans', value: 'PT Sans' },
          { label: 'Lato', value: 'Lato' },
          { label: 'Space Mono', value: 'Space Mono' },
          { label: 'Work Sans', value: 'Work Sans' },
          { label: 'Rubik', value: 'Rubik' },
        ],
      },
      form: this.formBuilder.group({
        fontFamily: [initialValue.fontFamily],
        fontWeight: [initialValue.fontWeight],
        fontStyle: [initialValue.fontStyle],
        textDecoration: [initialValue.textDecoration],
        fontSize: [initialValue.fontSize, [Validators.min(1), Validators.max(100)]],
        color: [initialValue.color],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleFontForm(elementCmp: PebEditorElement): Observable<any> {
    const elDef = elementCmp.definition;
    const font = elementCmp.font;

    return merge(
      font.form.valueChanges.pipe(
        tap((changes) => {
          if (font.form.invalid) {
            this.logger.log('Font: Change: Invalid');
            return;
          }

          this.logger.log('Opacity: Change: Valid ', font.form.value);

          elementCmp.styles = {
            ...elementCmp.styles,
            ...changes,
          }
          elementCmp.applyStyles();
        }),
      ),
      font.submit.pipe(
        switchMap(() => {
          if (font.form.invalid || isEqual(font.initialValue, font.form.value)) {
            return EMPTY;
          }

          this.logger.log('Opacity: Submit ', font.form.value);

          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: font.form.value,
          })
        }),
      ),
    );
  }

  /**
   *  Proportions
   */
  protected initProportionsForm(elementCmp: PebEditorElement) {
    const initialValue = {
      objectFit: elementCmp.styles.objectFit as string ?? 'contain',
    };

    elementCmp.proportions = {
      initialValue,
      form: this.formBuilder.group({
        objectFit: [initialValue.objectFit],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleProportionsForm(elementCmp: PebEditorElement): Observable<any> {
    const elDef = elementCmp.definition;
    const proportions = elementCmp.proportions;

    return merge(
      proportions.form.valueChanges.pipe(
        tap((changes) => {
          if (proportions.form.invalid) {
            this.logger.log('Proportions: Change: Invalid');
            return;
          }

          this.logger.log('Proportions: Change: Valid ', proportions.form.value);

          elementCmp.styles = {
            ...elementCmp.styles,
            ...changes,
          };
          elementCmp.applyStyles();
        }),
      ),
      proportions.submit.pipe(
        switchMap(() => {
          if (proportions.form.invalid || isEqual(proportions.initialValue, proportions.form.value)) {
            return EMPTY;
          }

          this.logger.log('Proportions: Submit ', proportions.form.value);

          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: proportions.form.value,
          })
        }),
      ),
    );
  }

  /**
   *  Shadow
   */
  protected initShadowForm(elementCmp: PebEditorElement) {
    const shadowValues = this.getShadowValuesFromString(elementCmp.styles.boxShadow as string);
    const initialValue = {
      hasShadow: !!elementCmp.styles.boxShadow && elementCmp.styles.boxShadow !== 'inherit',
      shadowBlur: shadowValues.blur ?? 5,
      shadowColor: shadowValues.color ?? '#000000',
      shadowOffset: shadowValues.offset ?? 20,
      shadowOpacity:
        shadowValues.opacity ?? 100,
      shadowAngle: shadowValues.angle ?? 315,
    };

    elementCmp.shadow = {
      initialValue,
      form: this.formBuilder.group({
        hasShadow: [initialValue.hasShadow],
        shadowColor: [initialValue.shadowColor],
        shadowOffset: [initialValue.shadowOffset],
        shadowBlur: [initialValue.shadowBlur, [Validators.min(1), Validators.max(100)]],
        shadowOpacity: [initialValue.shadowOpacity, [Validators.min(1), Validators.max(100)]],
        shadowAngle: [initialValue.shadowAngle, [Validators.min(0), Validators.max(360)]],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleShadowForm(elementCmp: PebEditorElement): Observable<any> {
    const elDef = elementCmp.definition;
    const shadow = elementCmp.shadow;

    return merge(
      shadow.form.valueChanges.pipe(
        tap((changes) => {
          if (shadow.form.invalid) {
            this.logger.log('Shadow: Change: Invalid');
            return;
          }

          this.logger.log('Shadow: Change: Valid ', shadow.form.value);
          elementCmp.styles = {
            ...elementCmp.styles,
            boxShadow: this.getShadowString(shadow.form.value),
          }
          elementCmp.applyStyles();
        }),
      ),
      shadow.submit.pipe(
        switchMap(() => {
          if (shadow.form.invalid || isEqual(shadow.initialValue, shadow.form.value)) {
            return EMPTY;
          }

          this.logger.log('Shadow: Submit ', shadow.form.value);

          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: { boxShadow: this.getShadowString(shadow.form.value) },
          })
        }),
      ),
    );
  }

  /**
   *  Background
   */
  protected initBackgroundForm(elementCmp: PebEditorElement) {
    const bgGradient: BgGradient = getGradientProperties(elementCmp.styles);

    const initialValue = {
      bgColor: elementCmp.styles.backgroundColor?.toString() || '',
      bgColorGradientAngle: bgGradient.angle,
      bgColorGradientStart: bgGradient.startColor,
      bgColorGradientStop: bgGradient.endColor,
      file: null,
      bgImage: elementCmp.styles.backgroundImage?.toString() || '',
      fillType: initFillType(elementCmp.styles),
      imageSize: getSelectedOption(
        this.ImageSizes,
        elementCmp.styles.backgroundSize,
        PageSidebarDefaultOptions.ImageSize,
      ),
      imageScale: getBgScale(elementCmp.styles),
    };

    elementCmp.background = {
      initialValue,
      form: this.formBuilder.group({
        bgColor: [initialValue.bgColor],
        bgColorGradientAngle: [initialValue.bgColorGradientAngle],
        bgColorGradientStart: [initialValue.bgColorGradientStart],
        bgColorGradientStop: [initialValue.bgColorGradientStop],
        file: [initialValue.file],
        bgImage: [initialValue.bgImage],
        fillType: [initialValue.fillType],
        imageSize: [initialValue.imageSize],
        imageScale: [initialValue.imageScale],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleBackgroundForm(elementCmp: PebEditorElement, sidebarRef: ComponentRef<any>): Observable<any> {
    const sectionBackground = elementCmp.background;

    return merge(
      sectionBackground.form.get('bgColor').valueChanges.pipe(
        tap((value) => {
          elementCmp.styles = {
            ...elementCmp.styles,
            backgroundColor: value,
            backgroundImage: '',
          };
          elementCmp.applyStyles();
          elementCmp.detectChanges();

          if (value && sectionBackground.form.get('fillType').value.name !== FillType.ColorFill) {
            const fillType = getFillType(FillType.ColorFill);
            sectionBackground.form.get('fillType').patchValue(fillType);
          }

          sidebarRef.changeDetectorRef.detectChanges();
        }),
        debounceTime(300),
        tap(() => sectionBackground.submit.next()),
      ),

      sectionBackground.form.get('bgColorGradientAngle').valueChanges.pipe(
        tap((value: number) => {
          if (value || value === 0) {
            const gradient = this.getBackgroundGradient(value, null, null, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientStart').valueChanges.pipe(
        tap((value: string) => {
          if (value ?? value) {
            const gradient = this.getBackgroundGradient(null, value, null, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientStop').valueChanges.pipe(
        tap((value: string) => {
          if (value ?? value) {
            const gradient = this.getBackgroundGradient(null, null, value, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgImage').valueChanges.pipe(
        tap((value: string) => {
          elementCmp.styles.backgroundColor = value ? '' : elementCmp.styles.backgroundColor;
          elementCmp.styles.backgroundImage = value;
          elementCmp.applyStyles();
          elementCmp.detectChanges();

          this.updateImageScaleFieldSetting(sectionBackground.form);
          sidebarRef.changeDetectorRef.detectChanges();
        }),
        debounceTime(300),
        switchMap((value: string) => {
          return this.store.updateStyles(this.state.screen, {
            [elementCmp.definition.id]: { backgroundImage: value, backgroundColor: '' },
          }).pipe(
            tap(() => showImageSpinner(false, elementCmp)),
          );
        }),
      ),

      sectionBackground.form.get('file').valueChanges.pipe(
        switchMap(async (file: File) => {
          const nextSource = await toBase64(file);

          if (sectionBackground.form.controls.bgImage.value === nextSource) {
            return;
          }

          sectionBackground.form.controls.bgImage.patchValue(nextSource);

          // we need this because the request stops if the element has lost focus.
          // TODO: Delete the hack after a more correct solution for image upload is implemented
          const image = await this.mediaService.uploadImage(file, PebShopContainer.Builder).toPromise()
          elementCmp.styles.backgroundImage = image.blobName;
          elementCmp.applyStyles();
          this.store.updateStyles(this.state.screen, {
            [elementCmp.definition.id]: { backgroundImage: image.blobName },
          });
        }),
      ),

      sectionBackground.form.get('imageSize').valueChanges.pipe(
        tap((option: SelectOption) => {
          const data: any = {};
          let backgroundSize = option.value;
          data.backgroundPosition = (option.value === ImageSize.Initial || option.value === ImageSize.OriginalSize)
            ? 'center'
            : 'initial';
          data.backgroundRepeat = 'no-repeat';

          if (option.value === 'initial' || option.value === 'auto') {
            backgroundSize = Number(elementCmp.styles.backgroundSize.toString().slice(0, -1)) || 100;
          }

          if (option.value === ImageSize.Initial) {
            data.backgroundRepeat = 'space';
          }

          if (option.value === ImageSize.Initial || option.value === ImageSize.OriginalSize) {
            sectionBackground.form.get('imageScale').patchValue(backgroundSize);
          } else {
            this.updateStyles(elementCmp, { backgroundSize });
          }
          elementCmp.styles = { ...elementCmp.styles, ...data };
          elementCmp.applyStyles();
          this.updateImageScaleFieldSetting(sectionBackground.form);
          sectionBackground.submit.next();
        }),
      ),

      sectionBackground.form.get('fillType').valueChanges.pipe(
        tap((option: SelectOption) => {
          const data: any = {};

          switch (option.name) {
            case FillType.ColorFill:
              data.backgroundColor = elementCmp.styles.backgroundColor || PageSidebarDefaultOptions.BgColor;
              data.backgroundImage = '';
              break;
            case FillType.ImageFill:
              const control = sectionBackground.form.get('bgImage');
              data.backgroundColor = '';
              data.backgroundImage = isBackgroundGradient(control.value, sectionBackground.form)
                ? control.setValue('', { emitEvent: false })
                : control.value;
              break;
            case FillType.GradientFill:
              data.backgroundColor = '';
              data.backgroundImage = this.getBackgroundGradient(null, null, null, sectionBackground.form);
              break;
            case FillType.None:
              data.backgroundColor = '';
              data.backgroundImage = '';
              break;
          }

          // Drop data for gradient in form
          if (option.name !== FillType.GradientFill) {
            sectionBackground.form.get('bgColorGradientAngle').patchValue('', { emitEvent: false });
            sectionBackground.form.get('bgColorGradientStart').patchValue('', { emitEvent: false });
            sectionBackground.form.get('bgColorGradientStop').patchValue('', { emitEvent: false });
          }

          sectionBackground.form.get('bgColor').patchValue(data.backgroundColor);
          sectionBackground.form.get('bgImage').patchValue(data.backgroundImage, { emitEvent: false });

          this.updateImageScaleFieldSetting(sectionBackground.form);
        }),
      ),

      sectionBackground.form.get('imageScale').valueChanges.pipe(
        map((value: number) => Number(value) ? `${value}%` : value),
        filter((value: string) => (
          elementCmp.styles.backgroundSize !== value
          && (
            sectionBackground.form.get('imageSize').value.value === ImageSize.Initial
            || sectionBackground.form.get('imageSize').value.value === ImageSize.OriginalSize
          )
        )),
        tap((value) => this.updateStyles(elementCmp, { backgroundSize: value })),
        debounceTime(300),
        tap(() => sectionBackground.submit.next()),
      ),

      sectionBackground.submit.pipe(
        switchMap(() => {
          if (sectionBackground.form.invalid || isEqual(sectionBackground.initialValue, sectionBackground.form.value)) {
            return EMPTY;
          }

          this.logger.log('Background: Submit ', sectionBackground.form.value);
          const screen = elementCmp.target.element.data?.sync ? Object.values(PebScreen) : this.state.screen;
          return this.store.updateStyles(screen, {
            [ elementCmp.definition.id ]: elementCmp.styles,
          });
        }),
      ),
    );
  }

  /**
   * categories
   */
  protected initCategoriesForm(elCmp: PebEditorElement) {
    const initialValue = {
      type: elCmp.definition.data?.categoryType || CategoryTypeOptions[0],
      categories: [],
    };
    const categoryIds = elCmp.definition.data?.categoryIds;
    if (categoryIds) {
      const categories = (elCmp.target.context as any)?.categories;
      let categoriesDict = {};
      if (categories && categories.state === PebElementContextState.Ready) {
        categories.data.forEach(category => categoriesDict[category.id] = category);
      }
      initialValue.categories = categoryIds.map(id => categoriesDict[id]);
    }
    elCmp.categories = {
      initialValue,
      form: this.formBuilder.group({
        type: [initialValue.type],
        categories: [initialValue.categories],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleCategoriesForm(elementCmp: PebEditorElement) {
    const elCategories = elementCmp.categories;
    return merge(
      elCategories.submit.pipe(
        switchMap(() => {
          const { type, categories } = elCategories.form.value;
          let method: string;
          switch (type.value) {
            case CategoryType.none:
            case CategoryType.custom:
              method = 'getProductCategoriesByIds';
              break;
            case CategoryType.all:
              method = 'getProductsCategories';
              break;
          }
          return this.store.updateElement({
            ...elementCmp.definition,
            data: {
              ...elementCmp.definition.data || {},
              categoryType: type,
              categoryIds: categories.map(category => category.id),
            },
          }).pipe(
            switchMap(() => this.store.updateContext(elementCmp.definition.id, {
              method,
              service: 'products',
              params: [categories.map(category => category.id), 1],
            })),
          );
        }),
      ),
    );
  }

  protected initBorderForm(elementCmp: PebEditorElement) {
    const { styles } = elementCmp;
    const initialValue: PebBorderStyles = {
      borderWidth: styles.borderWidth as number ?? 0,
      borderStyle: styles.borderStyle as string ?? 'solid',
      borderColor: styles.borderColor as string ?? '#000',
      hasBorder: !!styles.borderWidth,
    };

    elementCmp.border = {
      initialValue,
      form: this.formBuilder.group({
        hasBorder: [initialValue.hasBorder],
        borderColor: [initialValue.borderColor],
        borderStyle: [initialValue.borderStyle],
        borderWidth: [initialValue.borderWidth, [Validators.min(0), Validators.max(100)]],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleBorderForm(elementCmp: PebEditorElement): Observable<any> {
    const elDef = elementCmp.definition;
    const border = elementCmp.border;

    return merge(
      border.form.valueChanges.pipe(
        tap((changes) => {
          if (border.form.invalid) {
            this.logger.log('Border: Change: Invalid');
            return;
          }

          this.logger.log('Border: Change: Valid ', border.form.value);

          const { borderWidth, borderColor, borderStyle } = border.form.value;

          elementCmp.styles = {
            ...elementCmp.styles,
            borderWidth,
            borderColor,
            borderStyle,
          }
          elementCmp.applyStyles();
        }),
      ),
      border.submit.pipe(
        switchMap(() => {
          if (border.form.invalid || isEqual(border.initialValue, border.form.value)) {
            return EMPTY;
          }
          this.logger.log('Border: Submit ', border.form.value);
          const { borderWidth, borderColor, borderStyle } = border.form.value;
          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: { borderWidth, borderColor, borderStyle },
          })
        }),
      ),
    );
  }

  private getShadowValuesFromString(shadowString: string): ShadowValues {
    if (!shadowString || shadowString === 'inherit') {
      return {} as ShadowValues;
    }

    shadowString = shadowString.replace(')', '');
    const shadowValuesArray = shadowString.split(' ');
    const shadowValuesColors = shadowValuesArray[4].replace('rgba(', '').split(',');
    const offsetX = +shadowValuesArray[0].replace('pt', '');
    const offsetY = +shadowValuesArray[1].replace('pt', '');
    const angle = Math.round(Math.atan2(-offsetY, offsetX) * (180 / Math.PI));
    return {
      blur: +shadowValuesArray[2].replace('pt', ''),
      offset: Math.round(Math.sqrt(offsetX * offsetX + offsetY * offsetY)),
      color: rgbToHex(+shadowValuesColors[0], +shadowValuesColors[1], +shadowValuesColors[2]),
      opacity: Math.round(+shadowValuesColors[3] * 100),
      angle: angle >= 0 ? angle : angle + 360,
    };
  }

  private getShadowString(values: ShadowStyles): string {
    if (!values.hasShadow) {
      return 'inherit';
    }

    const blur = (values.shadowBlur) + 'pt';
    const color = hexToRgb(values.shadowColor);
    const offset = values.shadowOffset;
    const angle = values.shadowAngle;
    const offsetX = (offset * Math.cos(angle * Math.PI / 180)) + 'pt';
    const offsetY = (offset * -Math.sin(angle * Math.PI / 180)) + 'pt';
    const opacity = values.shadowOpacity / 100;
    return `${offsetX} ${offsetY} ${blur} 0 rgba(${color.r},${color.g},${color.b},${opacity})`;
  }

  private getBackgroundGradient(deg?: number, start?: string, end?: string, form?: FormGroup): string {
    let degrees = '90deg';
    if (deg || form.get('bgColorGradientAngle').value) {
      degrees = (deg ? deg : form.get('bgColorGradientAngle').value) + 'deg';
    }
    const startGradient = start || form.get('bgColorGradientStart').value || 'white';
    const endGradient = end || form.get('bgColorGradientStop').value || 'white';

    return `linear-gradient(${degrees}, ${startGradient}, ${endGradient})`;
  }

  private updateGradientBackground(gradient: string, form: FormGroup): void {
    form.get('bgColor').patchValue('', { emitEvent: false });
    form.get('bgImage').patchValue(gradient);
  }

  private updateImageScaleFieldSetting(form: FormGroup) {
    const imageSize: ImageSize = form.get('imageSize').value.value;
    if (
      form.get('fillType').value.name === FillType.ImageFill &&
      (imageSize === ImageSize.Initial ||
        imageSize === ImageSize.OriginalSize) &&
      !!form.get('bgImage').value
    ) {
      form.get('imageScale').enable({ emitEvent: false });
    } else {
      form.get('imageScale').disable({ emitEvent: false });
    }
  }

  public updateStyles(element, styles) {
    if (styles.backgroundColor || styles.backgroundColor === '') {
      element.styles.backgroundColor = styles.backgroundColor;
    }
    if (styles.backgroundImage || styles.backgroundImage === '') {
      element.styles.backgroundImage = styles.backgroundImage;
    }

    if (styles?.height) {
      element.styles.height = styles.height;
    }

    element.styles = { ...element.styles, ...styles };
    element.applyStyles();

    return styles;
  }
}
