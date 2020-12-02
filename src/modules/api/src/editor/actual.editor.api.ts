import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  PebAction,
  PebEnvService,
  PebPageId,
  PebShopGeneratedThemeResponse,
  PebShopId,
  PebShopImageResponse,
  PebShopTheme,
  PebShopThemeEntity,
  PebShopThemeId,
  PebShopThemeSnapshot,
  PebShopThemeSourceId,
  PebShopThemeSourcePagePreviews,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
} from '@pe/builder-core';

import { PEB_GENERATOR_API_PATH, PEB_MEDIA_API_PATH, PEB_STORAGE_PATH } from '../constants';
import { CreateShopThemeDto, CreateShopThemePayload, PebEditorApi } from './abstract.editor.api';
import { PEB_SHOPS_API_PATH } from '../shops/actual.shops.api';

export const PEB_EDITOR_API_PATH = new InjectionToken<string>('PEB_EDITOR_API_PATH');

@Injectable()
export class PebActualEditorApi implements PebEditorApi {

  constructor(
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
    @Inject(PEB_SHOPS_API_PATH) private shopApiPath: string,
    @Inject(PEB_GENERATOR_API_PATH) private apiGeneratorPath: string,
    @Inject(PEB_MEDIA_API_PATH) private apiMediaPath: string,
    @Inject(PEB_STORAGE_PATH) private mediaStoragePath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) {}

  getSnapshot(themeId: PebShopThemeId): Observable<PebShopThemeSnapshot> {
    return this.http.get<PebShopThemeSnapshot>(`${this.editorApiPath}/api/theme/${themeId}/snapshot`);
  }

  getActions(themeId: PebShopThemeId): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(`${this.editorApiPath}/api/theme/${themeId}/actions`);
  }

  getAllAvailableThemes(): Observable<PebShopTheme[]> {
    const endpoint = `${this.editorApiPath}/api/themes`;

    return this.http.get<any[]>(endpoint);
  }

  getShopThemesList(): Observable<any> {
    const { businessId, shopId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

    return this.http.get(endpoint);
  }

  getShopThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getShopActiveTheme(shopId: PebShopId): Observable<any> {
    const { businessId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes/active`;

    return this.http.get(endpoint);
  }

  createShopTheme(input: CreateShopThemePayload): Observable<CreateShopThemeDto> {
    return this.http.post(`${this.editorApiPath}/api/theme`, input);
  }

  addAction(shopId: PebShopId, action: PebAction): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/theme/${shopId}/action`, action);
  }

  undoAction(themeId: PebShopId, actionId: PebPageId): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/action/${actionId}`);
  }

  updateReplica(themeId: string, oldInitAction: PebAction, newInitAction: PebAction): Observable<any> {
    throw new Error('Not implemented yet');
  }


  getShopThemeVersions(themeId: string): Observable<PebShopThemeVersionEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/versions`);
  }

  createShopThemeVersion(themeId: PebShopId, name: string): Observable<PebShopThemeVersionEntity> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/version`, { name });
  }

  updateShopThemePreview(themeId: PebShopId, imagePreview: string): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/image-preview`, { imagePreview });
  }

  updateShopThemeName(themeId: any, name: string): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/name`, { name });
  }

  deleteShopThemeVersion(themeId: PebShopId, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  activateShopThemeVersion(themeId: PebShopId, versionId: PebShopThemeVersionId): Observable<CreateShopThemeDto> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  publishShopThemeVersion(themeId: PebShopId, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.put(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/publish`, {}).pipe(
    );
  }

  getTemplateThemes(): Observable<PebShopThemeEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  generateTemplateTheme(
    category: string,
    page: string,
    theme: string,
    logo?: string,
  ): Observable<PebShopGeneratedThemeResponse> {
    const payload = {
      category,
      page,
      theme,
      logo,
    };
    return this.http.post<PebShopGeneratedThemeResponse>(
      `${this.apiGeneratorPath}/api/builder-generator/business/${this.envService.businessId}/generate`,
      payload,
    );
  }

  updateThemeSourcePagePreviews(
    themeId: PebShopThemeId,
    sourceId: PebShopThemeSourceId,
    previews: PebShopThemeSourcePagePreviews,
  ): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`, previews);
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/install`, {});
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/template/${themeId}/instant-setup`, {});
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}`, {});
  }

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/duplicate`, {});
  }

  getShops(isDefault?: boolean): Observable<any[]> {
    console.warn('Method is deprecated. Use PebActualShopsApi.getShopsList()');
    return this.http.get<any[]>(`${this.shopApiPath}/business/${this.envService.businessId}/shop`, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getShop(shopId: PebShopId): Observable<any> {
    console.warn('Method is deprecated. Use PebActualShopsApi.getSingleShop()');
    return this.http.get<any[]>(`${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}`);
  }

  updateShopDeploy(accessId: string, payload: any): Observable<any> {
    console.warn('Method is deprecated. Use PebActualShopsApi.updateShopDeploy()');
    return this.http.patch<any[]>(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/access/${accessId}`,
      payload,
    );
  }

  createShop(payload: any): Observable<any> {
    console.warn('Method is deprecated. Use PebActualShopsApi.createShop()');
    return this.http.post<any[]>(`${this.shopApiPath}/business/${this.envService.businessId}/shop`, payload);
  }

  deleteShop(shopId: string): Observable<null> {
    console.warn('Method is deprecated. Use PebActualShopsApi.deleteShop()');
    return this.http.delete<null>(`${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}`);
  }

  setAsDefaultShop(shopId: string): Observable<any> {
    console.warn('Method is deprecated. Use PebActualShopsApi.markShopAsDefault()');
    return this.http.put<any>(`${this.shopApiPath}/business/${this.envService.businessId}/shop/${shopId}/default`, {});
  }

  updateShop(payload: any): Observable<any> {
    return this.http.patch<any[]>(
      `${this.shopApiPath}/business/${this.envService.businessId}/shop/${this.envService.shopId}`,
      payload,
    );
  }

  // TODO(@mivnv): Move it to the media service
  uploadImage(container: string, file: File, returnShortPath: boolean): Observable<PebShopImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebShopImageResponse) => {
          return {
            ...response,
            blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${response.blobName}`,
          }
        }),
        catchError(err => {
        // console.error('Behavior threw error: ', err);
        return of(null);
      }));
  }

  // TODO(@mivnv): Move it to the media service
  uploadImageWithProgress(
    container: string,
    file: File,
    returnShortPath: boolean,
  ): Observable<HttpEvent<PebShopImageResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<PebShopImageResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
            }
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${event.body.blobName}`,
              },
            }
          }
          default:
            return event;
        }
      }),
      catchError(err => {
      // console.error('Behavior threw error: ', err);
        return of(null);
    }));
  }

  // TODO(@mivnv): Move it to the media service
  uploadVideo(container: string, file: File): Observable<PebShopImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebShopImageResponse) => {
          return {
            ...response,
            blobName: `${this.mediaStoragePath}/${container}/${response.blobName}`,
            preview: `${this.mediaStoragePath}/${container}/${response.preview}`,
          };
        }),
        catchError(err => {
        // console.error('Behavior threw error: ', err);
          return of(null);
      }));
  }

  // TODO(@mivnv): Move it to the media service
  uploadVideoWithProgress(container: string, file: File): Observable<HttpEvent<PebShopImageResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<PebShopImageResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
            }
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${this.mediaStoragePath}/${container}/${event.body.blobName}`,
                preview: `${this.mediaStoragePath}/${container}/${event.body.preview}`,
              },
            }
          }
          default:
            return event;
        }
      }),
      catchError(err => {
        // console.error('Behavior threw error: ', err);
        return of(null);
    }));
  }

  getShopPreview(shopId: string, include?: string[]): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${shopId}/preview`;

    return this.http.get(endpoint);
  }

  getShopPreviewPages(shopId: string, pageId?: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/source/pages/${pageId ? pageId : ''}`);
  }

  getThemePreviewPages(shopId: string, pageId?: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/application/${shopId}/source/pages/${pageId ? pageId : ''}`);
  }

}
