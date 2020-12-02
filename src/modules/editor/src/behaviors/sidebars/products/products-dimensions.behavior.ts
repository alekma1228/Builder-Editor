import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs';
import { filter, pairwise, startWith, switchMap, tap } from 'rxjs/operators';

import { pebCreateLogger } from '@pe/builder-core';

import { Axis, PebEditorElement } from '../../../renderer/editor-element';
import { DimensionsFormValues } from '../_sidebar.behavior';
import { PebEditorStore } from '../../../services/editor.store';
import { PebEditorState } from '../../../services/editor.state';
import { getColumnsAndRows } from './products.utils';

const PRODUCTS_MARGIN = 15;

const log = pebCreateLogger('editor:behaviors:edit-products');

@Injectable({ providedIn: 'any' })
export class ProductsDimensionsBehavior {
  logger = { log };

  constructor(
    private formBuilder: FormBuilder,
    private store: PebEditorStore,
    private state: PebEditorState,
  ) {}

  initDimensionsForm(elementCmp: PebEditorElement) {
    const initialValue = {
      width: +elementCmp.styles.itemWidth || 220,
      height: +elementCmp.styles.itemHeight || 280,
    };

    const [productDimensionsLimits] = this.getDimensionsLimits(elementCmp);

    if (!productDimensionsLimits) {
      return;
    }

    elementCmp.productDimensions = {
      initialValue,
      form: this.formBuilder.group({
        width: [
          initialValue.width,
          [
            Validators.min(productDimensionsLimits.width.min),
            Validators.max(productDimensionsLimits.width.max),
          ],
        ],
        height: [
          initialValue.height,
          [
            Validators.min(productDimensionsLimits.height.min),
            Validators.max(productDimensionsLimits.height.max),
          ],
        ],
      }),
      limits: {
        width: new BehaviorSubject(productDimensionsLimits.width),
        height: new BehaviorSubject(productDimensionsLimits.height),
        // TODO: proportional
      },
      activate: this.activateDimensionsForm(elementCmp),
      update: this.updateDimensionsForm(elementCmp),
      submit: new Subject<any>(),
    };
  }

  protected activateDimensionsForm = (elementCmp: PebEditorElement) => () => {
    const dssLimits = {
      width: elementCmp.productDimensions.limits.width.value,
      height: elementCmp.productDimensions.limits.height.value,
    };

    if (
      (elementCmp.styles.itemWidth || 220) > dssLimits.width.max ||
      (elementCmp.styles.itemHeight || 280) > dssLimits.height.max
    ) {
      elementCmp.productDimensions.form.setValue(
        {
          width: Math.min(+elementCmp.styles.itemWidth, dssLimits.width.max),
          height: Math.min(+elementCmp.styles.itemHeight, dssLimits.height.max),
        },
        { emitEvent: false },
      );
    }
  };

  protected updateDimensionsForm = (elementCmp: PebEditorElement) => () => {
    const [productDimensionsLimits] = this.getDimensionsLimits(elementCmp);
    const productDssForm: FormGroup = elementCmp.productDimensions.form;
    productDssForm.controls.width.setValidators([
      Validators.min(productDimensionsLimits.width.min),
      Validators.max(productDimensionsLimits.width.max),
    ]);
    productDssForm.controls.height.setValidators([
      Validators.min(productDimensionsLimits.height.min),
      Validators.max(productDimensionsLimits.height.max),
    ]);

    elementCmp.productDimensions.limits.width.next(
      productDimensionsLimits.width,
    );
    elementCmp.productDimensions.limits.height.next(
      productDimensionsLimits.height,
    );
  };

  getDimensionsLimits(elementCmp: PebEditorElement) {
    const {
      productTemplateColumns,
      productTemplateRows,
    } = getColumnsAndRows(elementCmp);

    const widthMaxDimensions = elementCmp.getMaxPossibleDimensions(
      Axis.Horizontal,
    );
    const heightMaxDimensions = elementCmp.getMaxPossibleDimensions(
      Axis.Vertical,
    );

    const widthMinDimensions =
      elementCmp.getMinPossibleDimensions(Axis.Horizontal) /
      productTemplateColumns;

    const heightMinDimensions =
      elementCmp.getMinPossibleDimensions(Axis.Vertical) / productTemplateRows;

    if (!widthMaxDimensions || !heightMaxDimensions) {
      return;
    }

    return [
      {
        width: {
          min: widthMinDimensions,
          max:
            (widthMaxDimensions.size - widthMaxDimensions.spaceStart) /
            productTemplateColumns,
        },
        height: {
          min: heightMinDimensions,
          max:
            (heightMaxDimensions.size - heightMaxDimensions.spaceStart) /
            productTemplateRows,
        },
      },
    ];
  }

  handleDimensionsForm(elCmp: PebEditorElement): Observable<any> {
    const elDef = elCmp.definition;
    const productDimensions = elCmp.productDimensions;

    if (!productDimensions) {
      return EMPTY;
    }

    return merge(
      productDimensions.form.valueChanges.pipe(
        startWith(null as DimensionsFormValues),
        pairwise(),
        tap(([prevValue, value]: DimensionsFormValues[]) => {
          if (productDimensions.form.invalid) {
            this.logger.log('Dimensions: Change: Invalid');
            return;
          }

          const {
            productTemplateColumns,
            productTemplateRows,
          } = getColumnsAndRows(elCmp);

          elCmp.styles.itemWidth = value.width;
          elCmp.styles.itemHeight = value.height;
          const minWidth =
            value.width * productTemplateColumns +
            productTemplateColumns * PRODUCTS_MARGIN;
          const minHeight = value.height * productTemplateRows;

          elCmp.styles.width =
            elCmp.styles.width < minWidth
              ? minWidth
              : elCmp.dimensions.form.value.width;

          elCmp.styles.height =
            elCmp.styles.height < minHeight
              ? minHeight
              : elCmp.dimensions.form.value.height;

          elCmp.dimensions.form.patchValue(
            {
              width: elCmp.styles.width,
              height: elCmp.styles.height,
            },
            { emitEvent: false },
          );

          elCmp.applyStyles();
        }),
      ),
      productDimensions.submit.pipe(
        filter(() => productDimensions.form.valid),
        switchMap(() => {
          this.logger.log('Dimensions: Submit ', elCmp.dimensions.form.value);
          elCmp.productDimensions.update();
          elCmp.dimensions.form.patchValue(
            {
              width: elCmp.styles.width,
              height: elCmp.styles.height,
            },
            { emitEvent: false },
          );

          const payload: any = {
            itemWidth: productDimensions.form.value.width,
            itemHeight: productDimensions.form.value.height,
            height: elCmp.styles.height,
            width: elCmp.styles.width,
          };

          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: {
              ...payload,
            },
          });
        }),
      ),
    );
  }
}
