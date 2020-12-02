import { Observable } from 'rxjs';

import {
  PebAction,
  PebShop,
  PebShopGeneratedThemeResponse,
  PebShopImageResponse,
  PebShopTheme,
  PebShopThemeEntity,
  PebShopThemeId,
  PebShopThemeSnapshot,
  PebShopThemeSourceId,
  PebShopThemeSourcePagePreviews,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
  PebTheme,
} from '@pe/builder-core';

import { ShopPreviewDTO } from '../shops/abstract.shops.api';

export interface CreateShopThemePayload {
  name: string;
  content: PebShop;
}

export type CreateShopThemeDto = any;

export abstract class PebEditorApi {
  abstract getAllAvailableThemes(): Observable<PebShopTheme[]>;

  abstract createShopTheme(input: CreateShopThemePayload): Observable<CreateShopThemeDto>;

  abstract addAction(shopId: any, action: PebAction);

  abstract undoAction(themeId: any, actionId: string);

  abstract updateReplica(themeId: string, oldInitAction: PebAction, newInitAction: PebAction): Observable<any>;

  abstract getShopThemeVersions(themeId: any): Observable<PebShopThemeVersionEntity[]>;

  abstract createShopThemeVersion(themeId: any, name: string): Observable<PebShopThemeVersionEntity>;

  abstract deleteShopThemeVersion(themeId: any, versionId: PebShopThemeVersionId): Observable<any>;

  abstract activateShopThemeVersion(
    shopId: any,
    versionId: PebShopThemeVersionId,
  ): Observable<CreateShopThemeDto>;

  abstract publishShopThemeVersion(themeId: any, versionId: PebShopThemeVersionId): Observable<any>;

  abstract getShopActiveTheme(shopId: string): Observable<{
    id: string,
    theme: string,
    isActive: boolean,
    isDeployed: boolean,
  }>;

  abstract updateShopThemePreview(themeId: any, imagePreview: string): Observable<void>;

  abstract updateShopThemeName(themeId: any, name: string): Observable<any>;

  abstract generateTemplateTheme(
    category: string,
    page: string,
    theme: string,
    logo?: string,
  ): Observable<PebShopGeneratedThemeResponse>;

  abstract updateThemeSourcePagePreviews(
    themeId: PebShopThemeId,
    sourceId: PebShopThemeSourceId,
    previews: PebShopThemeSourcePagePreviews,
  ): Observable<any>;

  abstract getSnapshot(themeId: PebShopThemeId): Observable<PebShopThemeSnapshot>;

  abstract getActions(themeId: PebShopThemeId): Observable<PebAction[]>;

  // TODO: Should be deprecated
  abstract uploadImage(container: string, file: File, returnShortPath?: boolean): Observable<PebShopImageResponse>;

  // TODO: Should be deprecated
  abstract uploadImageWithProgress(container: string, file: File, returnShortPath?: boolean): Observable<any>;

  // TODO: Should be deprecated
  abstract uploadVideo(container: string, file: File): Observable<PebShopImageResponse>;

  // TODO: Should be deprecated
  abstract uploadVideoWithProgress(container: string, file: File): Observable<any>;

  /** @deprecated: Use PebThemesApi.getThemesList instead */
  abstract getShopThemesList(): Observable<any>;

  /** @deprecated: Use PebThemesApi.getThemeById instead */
  abstract getShopThemeById(themeId: PebShopThemeId): Observable<PebTheme>;

  /** @deprecated: Use PebThemesApi.getTemplateThemes instead */
  abstract getTemplateThemes(): Observable<PebShopThemeEntity[]>;

  /** @deprecated: Use PebThemesApi.installTemplateTheme instead */
  abstract installTemplateTheme(themeId: string): Observable<PebShopThemeEntity>;

  /** @deprecated: Use PebThemesApi.instantInstallTemplateTheme instead */
  abstract instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity>;

  /** @deprecated: Use PebThemesApi.deleteTemplateTheme instead */
  abstract deleteTemplateTheme(themeId: string): Observable<void>;

  /** @deprecated: Use PebThemesApi.duplicateTemplateTheme instead */
  abstract duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity>;

  /** @deprecated: Use PebShopsApi.getShopsList instead */
  abstract getShops(isDefault?: boolean): Observable<any[]>;

  /** @deprecated: Use PebShopsApi.getSingleShop instead */
  abstract getShop(shopId: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.createShop instead */
  abstract createShop(payload: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.deleteShop instead */
  abstract deleteShop(shopId: string): Observable<null>;

  /** @deprecated: Use PebShopsApi.updateShop instead */
  abstract updateShop(payload: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.markShopAsDefault instead */
  abstract setAsDefaultShop(shopId: string): Observable<any>;

  /** @deprecated: Use PebShopsApi.updateShopDeploy instead */
  abstract updateShopDeploy(shopId: string, payload: any): Observable<any>;

  /** @deprecated: Use PebShopsApi.getShopPreview instead */
  abstract getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO>;

}
