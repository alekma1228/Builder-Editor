import { of } from 'rxjs'
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

import { PebElementContextState, PebEnvService } from '@pe/builder-core';
import { PebActualProductsApi, PebProductsApi, PEB_PRODUCTS_API_PATH, PEB_STORAGE_PATH, PebProductCategory } from '@pe/builder-api';

/**
 * TODO(@dmlukichev): This should use PebProductsApi instead
 */
@Injectable({ providedIn: 'root' })
export class ProductsContext {

  constructor(
    private productsApi: PebProductsApi,
  ) { }

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
        title: '',
        price: '',
        currency: 'EUR',
        images: [
          '/assets/showcase-images/products/6.png',
        ],
        variants: [
          {
            id: 'variant_1',
            title: 'Product Title',
            description: 'Product Description',
            price: 100.00,
            options: [
              {
                id: 'option_1',
                name: 'Variant',
                value: 'First',
              },
            ],
          },
          {
            id: 'variant_2',
            title: 'Product Title',
            description: 'Product Description',
            price: 100.00,
            options: [
              {
                id: 'option_1',
                name: 'Variant',
                value: 'Second',
              },
            ],
          },
        ],
        description: '',
      },
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

  getProductsCatalog() {
    return of({
      state: 'ready',
      data: {
        sortBy: 'abc',
        shownFilters: false,
        activatedFilters: [],
        disabledFilters: [],
        title: 'Category Title',
        image: '',
        filters: [
          {
            name: 'Product Type A',
            active: true,
            disabled: false,
            children: [
              {
                name: 'Product A',
                active: true,
                disabled: false,
              },
              {
                name: 'Product B',
                active: false,
                disabled: false,
              },
              {
                name: 'Product C',
                active: false,
                disabled: false,
              },
              {
                name: 'Product D',
                active: false,
                disabled: false,
              },
              {
                name: 'Product E',
                active: false,
                disabled: false,
              },
            ],
          },
          {
            name: 'Product Type B',
            active: true,
            disabled: false,
            children: [
              {
                name: 'Product A',
                active: true,
                disabled: false,
              },
              {
                name: 'Product B',
                active: false,
                disabled: true,
              },
              {
                name: 'Product C',
                active: false,
                disabled: true,
              },
            ],
          },
        ],
        products: [
          {
            data: {
              title: 'Product A',
              price: '39.00',
              // image: '/assets/showcase-images/shoes/2.png',
            },
            state: PebElementContextState.Ready,
          },
          {
            data: {
              title: 'Product B',
              price: '39.00',
              // image: '/assets/showcase-images/shoes/3.png',
            },
            state: PebElementContextState.Ready,
          },
          {
            data: {
              title: 'Product C',
              price: '39.00',
              // image: '/assets/showcase-images/shoes/4.png',
            },
            state: PebElementContextState.Ready,
          },
          {
            data: {
              title: 'Product D',
              price: '39.00',
              // image: '/assets/showcase-images/products/5.png',
            },
            state: PebElementContextState.Ready,
          },
        ],
      },
    })
}

getProducts(id: string) {
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

  /** @deprecated */
  private mapProductData(product) {
  console.warn('Method is duplicated. This should be resolved in PebProductsApi');
  return (PebActualProductsApi.prototype as any).mapProductData.call(this, product);
}
}
