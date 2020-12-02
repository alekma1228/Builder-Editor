import { Observable } from 'rxjs';

export type PebProduct = any;

export interface PebProductCategory {
  title: string;
  id: string;
  image?: string;
  products?: PebProduct[];
}

export abstract class PebProductsApi {

  abstract getProducts(ids?: string[]): Observable<PebProduct[]>;

  abstract getProductsCategories(title?: string): Observable<PebProductCategory[]>;

  abstract getProductCategoriesByIds(ids?: string[]): Observable<PebProductCategory[]>;

  abstract getProductsByCategories(ids: string[]): Observable<{ [categoryId: string]: PebProduct[] }>;
}
