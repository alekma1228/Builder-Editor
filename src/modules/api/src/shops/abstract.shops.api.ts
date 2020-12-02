import { Observable } from 'rxjs';

import { PebShop, PebShopThemeSnapshot } from '@pe/builder-core';

export interface ShopPreviewDTO {
  current: PebShopThemeSnapshot,
  published: null|PebShop,
}

export abstract class PebShopsApi {
  abstract getShopsList(isDefault?: boolean): Observable<any[]>;

  abstract getSingleShop(shopId: string): Observable<any>;

  abstract createShop(payload: any): Observable<any>;

  abstract deleteShop(shopId: string): Observable<null>;

  abstract updateShop(payload: any): Observable<any>;

  abstract markShopAsDefault(shopId: string): Observable<any>;

  abstract updateShopDeploy(shopId: string, payload: any): Observable<any>;

  abstract getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO>;
}
