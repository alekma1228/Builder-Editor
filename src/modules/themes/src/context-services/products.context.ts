import { of } from 'rxjs'
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';

import { PebElementContextState } from '@pe/builder-core';
import { PebActualProductsApi, PebProductsApi, PebProductCategory } from '@pe/builder-api';

/**
 * TODO(@dmlukichev): This should use PebProductsApi instead
 */
@Injectable({ providedIn: 'root' })
export class ProductsContext {

  constructor(
    private productsApi: PebProductsApi,
  ) {}

  getByIds(ids: string[]) {
    return this.productsApi.getProducts(ids).pipe(
      map(data => ({
        state: PebElementContextState.Ready,
        data,
      })),
    );
  }

  getProductDetails() {
    return of({
      state: 'ready',
      data: {
        title: 'Product detail',
        description: '',
        price: '',
        salePrice: '',
        currency: 'EUR',
        images: [],
        variants: [
          {
            id: '',
            title: '',
            description: '',
            price: '',
            salePrice: '',
            disabled: false,
            options: [],
            images: [],
          },
        ],
      },
    });
  }

  getProducts() {
    return of({
      state: 'ready',
      data: [{
        title: 'Product',
        description: 'Description',
        price: '10',
        salePrice: '12',
        currency: 'USD',
        images: [
          '/assets/showcase-images/products/fill-1.svg',
        ],
      }],
    });
  }

  getProductsCategories(title?: string, getProducts = false) {
    return this.productsApi.getProductsCategories(title).pipe(
      switchMap((categories: PebProductCategory[]) => {
        return getProducts ? this.productsApi.getProductsByCategories(categories.map(c => c.id)).pipe(
          map((productsByCategories: any) => categories.map(category => {
            category.products = productsByCategories[category.id] || [];
            return category;
          })),
        ) : of(categories);
      }),
      map(data => ({ state: PebElementContextState.Ready, data })),
    );
  }

  getProductCategoriesByIds(ids?: string[], getProducts = false) {
    return this.productsApi.getProductCategoriesByIds(ids).pipe(
      switchMap((categories: PebProductCategory[]) => {
        return getProducts && categories.length ? this.productsApi.getProductsByCategories(categories.map(c => c.id)).pipe(
          map((productsByCategories: any) => categories.map(category => {
            category.products = productsByCategories[category.id] || [];
            return category;
          })),
        ) : of(categories);
      }),
      map(data => ({ state: PebElementContextState.Ready, data })),
    );
  }

  /** @deprecated */
  private mapProductData(product) {
    console.warn('Method is duplicated. This should be resolved in PebProductsApi');
    return (PebActualProductsApi.prototype as any).mapProductData.call(this, product);
  }
}
