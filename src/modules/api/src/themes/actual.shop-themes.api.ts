import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebEnvService, PebShopThemeEntity, PebShopThemeId } from '@pe/builder-core';

import { PebThemesApi } from './abstract.themes.api';
import { PEB_EDITOR_API_PATH } from './../editor/actual.editor.api';

@Injectable()
export class PebActualShopThemesApi implements PebThemesApi {
  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) {}

  getThemesList(): Observable<any> {
    const { businessId, shopId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

    return this.http.get(endpoint);
  }

  getThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<PebShopThemeEntity> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/install`,
      {},
    );
  }
}
