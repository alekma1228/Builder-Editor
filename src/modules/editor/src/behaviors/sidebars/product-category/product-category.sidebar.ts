import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

import { PebElementDef, PebElementStyles } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { defaultColors } from '../_deprecated-sidebars/shared/color-palette/default-colors';
import { SidebarBasic } from '../_deprecated-sidebars/sidebar.basic';
import { TextAlignmentConstants } from '../_deprecated-sidebars/shared/text/text-style.constants';
import { PebEditorElement } from '../../../renderer/editor-element';
import { fontNamesVariables } from '../_deprecated-sidebars/text-maker-sidebar/default-variables';
import { Font } from './products-category-font.behavior';

export enum ImageCornersConstants {
  RIGHT = 'right',
  ROUNDED = 'rounded',
}

@Component({
  selector: 'peb-editor-product-category-sidebar',
  templateUrl: 'product-category.sidebar.html',
  styleUrls: ['./product-category.sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorProductCategorySidebarComponent extends SidebarBasic {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() component: PebEditorElement;

  @Output() changeStyle = new EventEmitter<any>();
  @Output() addCategories = new EventEmitter();
  @Output() removeCategory = new EventEmitter<string>();

  productTitleFont: Font;
  productPriceFont: Font;
  categoryTitleFont: Font;
  categoryFilterFont: Font;

  defaultColumns = 3;
  gridColors = defaultColors;
  fontNames = fontNamesVariables;
  textAlignmentConstants = TextAlignmentConstants;
  imageCornersConstants = ImageCornersConstants;

  productsPerRowLimits = {
    min: 1,
    max: 6,
  };

  selectedCategoriesCount$: Observable<number>;

  styleForm: FormGroup = this.formBuilder.group({
    columns: [
      3,
      [
        Validators.min(this.productsPerRowLimits.min),
        Validators.max(this.productsPerRowLimits.max),
      ],
    ],
    textAlign: '',
    imageCorners: ImageCornersConstants.RIGHT,
  });

  productSettingsForm: FormGroup = this.formBuilder.group({
    selectAll: true,
    showPrice: true,
    showProductName: true,
  });

  constructor(
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    api: PebEditorApi,
  ) {
    super(api);
  }
}
