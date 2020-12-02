import { Observable } from 'rxjs';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';

import { PebProduct, PebProductCategory, PebProductsApi } from './abstract.products.api';
import { PEB_STORAGE_PATH } from '../constants';

export const PEB_PRODUCTS_API_PATH = new InjectionToken<string>('PEB_PRODUCTS_API_PATH');

@Injectable()
export class PebActualProductsApi implements PebProductsApi {
  constructor(
    @Inject(PEB_PRODUCTS_API_PATH) private productsApiPath: string,
    @Inject(PEB_STORAGE_PATH) private storagePath: string,
    private http: HttpClient,
    private envService: PebEnvService,
  ) {}

  getProducts(ids?: string[]): Observable<PebProduct[]> {
    return this.http.post(`${this.productsApiPath}/products`, {
      query: `{getProducts(
        businessUuid: "${this.envService.businessId}",
        ${ids ? `includeIds: [${ids.map(
          i => `"${i}"`,
        )}]` : ''}
        pageNumber: 1,
        paginationLimit: 100,
      ) {
        products {
          images
          _id
          title
          description
          price
          salePrice
          currency
          active
          categories { id title }
        }
      }}`,
    }).pipe(
      filter((result: any) => !!result?.data?.getProducts?.products),
      map((result: any) => result.data.getProducts.products),
      map((products: any) => products.map(product => this.mapProductData(product))),
    );
  }

  getProductsCategories(title?: string): Observable<PebProductCategory[]> {
    return this.http.post(`${this.productsApiPath}/products`, {
      query: `{
        getCategories (
          businessUuid: "${this.envService.businessId}",
          ${title ? `title: "${title}",` : ""}
        ) {
          id
          title
        }
      }`,
    }).pipe(
      map((result: any) => result.data.getCategories),
    );
  }

  getProductCategoriesByIds(ids?: string[]): Observable<PebProductCategory[]> {
    return this.http.post(`${this.productsApiPath}/products`, {
      query: `{
        getCategories (
          businessUuid: "${this.envService.businessId}",
        ) {
          id
          title
        }
      }`,
    }).pipe(
      map((result: any) => result.data.getCategories),
      map(categories => {
        const idsDict = ids.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
        return categories.filter(category => idsDict[category.id]);
      }),
    );
  }

  getProductsByCategories(ids: string[]): Observable<{ [categoryId: string]: PebProduct[] }> {
    return this.http.post<any>(`${this.productsApiPath}/products`, {
      query: `{
        getProductsByCategories (
          businessUuid: "${this.envService.businessId}",
          ${ids ? `categories: ["${ids.join('", "')}"]` : ''},
          paginationLimit: 100,
        ) {
          products {
            images
            _id
            title
            description
            price
            salePrice
            currency
            active
            categories { id title }
          }
        }
      }`
    }).pipe(
      filter((result: any) => !!result?.data?.getProductsByCategories?.products),
      map((result: any) => result.data.getProductsByCategories.products),
      map(products => products.reduce((acc, product) => {
        const p = this.mapProductData(product);
        if (p.categories) {
          p.categories.forEach(category => {
            if (acc[category.id]) {
              acc[category.id].push(p);
            } else {
              acc[category.id] = [p];
            }
          });
        }
        return acc;
      }, {})),
    );
  }

  private mapProductData(product) {
    return {
      id: product._id,
      title: product.title,
      description: product?.description,
      price: product.price,
      salePrice: product.salePrice,
      currency: product.currency,
      images: product.images?.map(
        i => `${this.storagePath}/products/${i}`,
      ),
      categories: product.categories || [],
      active: product.active,
      variants: product.variants
        ? product.variants.map(v => ({
          id: v.id,
          title: v.title,
          description: v?.description,
          price: v.price,
          salePrice: v.salePrice,
          options: v.options,
          images: v.images.map(
            i => `${this.storagePath}/products/${i}`,
          ),
        }))
        : null,
    };
  }
}
