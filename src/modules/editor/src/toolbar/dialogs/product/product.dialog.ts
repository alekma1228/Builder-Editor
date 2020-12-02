import { Component, Inject } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { OverlayData, OVERLAY_DATA } from '../../overlay.data';
import { ObjectCategory } from '../objects/objects.dialog';

enum ProductOptions {
  Product = 'Product',
  Detail = 'Product detail',
  Catalog = 'Catalog',
}
const PRODUCT_CATEGORIES: {[key: string]: ObjectCategory} = {
  [ProductOptions.Product]: {
    type: PebElementType.Products,
    style: {
      height: null,
      width: null,
    },
  },
  [ProductOptions.Detail]: {
    type: PebElementType.ProductDetails,
    style: {
      height: null,
      width: null,
    },
  },
  [ProductOptions.Catalog]: {
    type: PebElementType.ProductCatalog,
    style: {
      height: null,
      width: null,
    },
  },
};
@Component({
  selector: 'peb-editor-product-dialog',
  templateUrl: 'product.dialog.html',
  styleUrls: ['./product.dialog.scss'],
})
export class PebEditorProductDialogComponent {
  readonly productOptions: typeof ProductOptions = ProductOptions;

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
  ) {}

  addProduct(mediaType: ProductOptions): void {
    this.data.emitter.next(PRODUCT_CATEGORIES[mediaType]);
  }
}
