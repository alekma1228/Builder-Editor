import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import {
  PebEnvService,
  PebMediaService,
  PebMediaSidebarCollectionFilters,
  PebMediaSidebarCollectionItem } from '@pe/builder-core';

import { BUILDER_MEDIA_API_PATH, PEB_MEDIA_API_PATH, PEB_STORAGE_PATH, PEB_STUDIO_API_PATH } from '../constants';
import has = Reflect.has;

type ImageResponse = {blobName: string, brightnessGradation: string, thumbnail: string}


@Injectable({
  providedIn: 'root',
})
export class MediaService extends PebMediaService {

  constructor(
    @Inject(BUILDER_MEDIA_API_PATH) private builderMediaPath: string,
    @Inject(PEB_MEDIA_API_PATH) private mediaPath: string,
    @Inject(PEB_STORAGE_PATH) private storagePath: string,
    @Inject(PEB_STUDIO_API_PATH) private studioPath: string,
    private http: HttpClient,
    private envService: PebEnvService,
  ) {
    super();
  }

  private get businessId() {
    return this.envService.businessId;
  }

  getImageCollection(filters: PebMediaSidebarCollectionFilters,
                     page = 1, perPage = 54): Observable<PebMediaSidebarCollectionItem> {
    return this.http.get<PebMediaSidebarCollectionItem>
    (`${this.builderMediaPath}/api/selection`, this.applyFilters(filters,'image', page, perPage));
  }

  getVideoCollection(filters: PebMediaSidebarCollectionFilters,
                     page = 1, perPage = 54): Observable<PebMediaSidebarCollectionItem> {
    return this.http.get<PebMediaSidebarCollectionItem>
    (`${this.builderMediaPath}/api/selection`, this.applyFilters(filters,'video', page, perPage));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>
    (`${this.builderMediaPath}/api/selection/categories?type=image`);
  }

  getFormats(): Observable<string[]> {
    return this.http.get<string[]>
    (`${this.builderMediaPath}/api/selection/formats?type=image`);
  }

  getStyles(): Observable<string[]> {
    return this.http.get<string[]>
    (`${this.builderMediaPath}/api/selection/styles?type=image`);
  }

  uploadImage(file: File, container: string): Observable<any> {
    const formData = new FormData();
    formData.append('buffer', file, file.name);
    return this.http.post<any>(
      `${this.mediaPath}/api/image/business/${this.businessId}/${container}`,
      formData).pipe(
        map(response => {
          response.blobName = `${this.storagePath}/${container}/${response.blobName}`;
          response.thumbnail = `${this.storagePath}/${container}/${response.thumbnail}`;
          return response;
        }),
    );
  }


  uploadImageWithProgress(file: File, container: string) {
    const formData = new FormData();
    formData.append('buffer', file, file.name);
    return this.http.post<ImageResponse>(
      `${this.mediaPath}/api/image/business/${this.businessId}/${container}`,
      formData, {reportProgress: true, observe: 'events'}).pipe(
        map(event => {
          return {
            progress: event.type === HttpEventType.UploadProgress
              ? Math.round((100 * event.loaded) / event.total)
              : 0,
            ...(event.type === HttpEventType.Response && {
              body: {
                ...event.body,
                blobName: `${this.storagePath}/${container}/${event.body.blobName}`,
                thumbnail: `${this.storagePath}/${container}/${event.body.thumbnail}`,
              },
            }),
          }
        }),
      );
  }

  uploadVideo(file: File, container: string): Observable<any> {
    const formData = new FormData();
    formData.append('buffer', file, file.name);
    return this.http.post<any>(
      `${this.mediaPath}/api/video/business/${this.businessId}/${container}`,
      formData).pipe(
      map(response => {
        response.blobName = `${this.storagePath}/${container}/${response.blobName}`;
        response.thumbnail = `${this.storagePath}/${container}/${response.thumbnail}`;
        return response;
      }),
    );
  }

  searchMedia(keyword: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('name', keyword);
    return this.http.get<any>(`${this.studioPath}/api/${this.businessId}/media/search`, {params})
  }

  applyFilters(filters: PebMediaSidebarCollectionFilters, type: 'image' | 'video', page: number, perPage: number) {
    const {categories, formats, sortBy, styles, hasPeople} = filters;
    let params = new HttpParams();
    params = params.append('page', `${page}`);
    params = params.append('perPage', `${perPage}`);
    params = params.append('sortBy', sortBy);

    const filterTypes: { type, data }[] = [
      {
        type: 'type',
        data: type,
      },
    ];

    if (categories.length > 0) {
      filterTypes.push({
        type: 'categories',
        data: categories,
      });
    }

    if (formats.length > 0) {
      filterTypes.push({
        type: 'formats',
        data: formats,
      });
    }

    if (styles.length > 0) {
      filterTypes.push({
        type: 'styles',
        data: styles,
      });
    }

    filterTypes.push({
      type: 'hasPeople',
      data: hasPeople,
    });

    if (filterTypes.length > 0) {
      filterTypes.forEach((filter, i) => {
        if (filter.type === 'type') {
          params = params.append(`filters[${i}][field]`, 'type');
          params = params.append(`filters[${i}][condition]`, 'is');
          params = params.append(`filters[${i}][value]`, type);
        } else {
          if (filter.type === 'hasPeople') {
            params = params.append(`filters[${i}][field]`, 'hasPeople');
            params = params.append(`filters[${i}][condition]`, 'is');
            params = params.append(`filters[${i}][value]`, `${filter.data}`);
          } else {
            params = params.append(`filters[${i}][field]`, filter.type);
            params = params.append(`filters[${i}][condition]`, 'is');
            filter.data.forEach((value, index) => {
              params = params.append(`filters[${i}][value][${index}]`, `${value}`);
            });
          }
        }
      });
    }
    return {params};
  }
}
