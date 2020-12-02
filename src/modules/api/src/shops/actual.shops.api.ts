import { Observable } from 'rxjs';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { omit } from 'lodash';

import { PebEnvService } from '@pe/builder-core';

import { PebShopsApi, ShopPreviewDTO } from './abstract.shops.api';

export const PEB_SHOPS_API_PATH = new InjectionToken<string>('PEB_SHOPS_API_PATH');

@Injectable()
export class PebActualShopsApi implements PebShopsApi {
  constructor(
    @Inject(PEB_SHOPS_API_PATH) private shopApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  getShopsList(isDefault?: boolean): Observable<any[]> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop`;

    return this.http.get<any[]>(endpoint, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getSingleShop(shopId: string): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}`;

    return this.http.get<any>(endpoint);

  }

  createShop(payload: any): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop`;

    return this.http.post<any[]>(endpoint, payload);
  }

  deleteShop(shopId: string): Observable<null> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}`;

    return this.http.delete<null>(endpoint);
  }

  updateShop(payload: any): Observable<any> {
    const shopId = payload.id;
    const body = omit(payload, ['id']);
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}`;

    return this.http.patch<any>(endpoint, body);
  }

  markShopAsDefault(shopId: string): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/${shopId}/default`;

    return this.http.put<any>(endpoint, {});
  }

  updateShopDeploy(accessId: string, payload: any): Observable<any> {
    const endpoint = `${this.shopApiPath}/business/${this.businessId}/shop/access/${accessId}`;

    return this.http.patch<any[]>(endpoint, payload);
  }

  getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO> {
    const endpoint = `${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/preview`;

    return this.http.get<ShopPreviewDTO>(endpoint);
  }
}
