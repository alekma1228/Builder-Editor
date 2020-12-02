import { Observable } from 'rxjs';

export enum MediaType {
  Images = 'images',
  Videos = 'videos',
}

export interface PebMediaItem {
  age?: string;
  area?: string[];
  background?: string;
  body?: string;
  brightness?: string;
  categories?: string[];
  color?: string;
  createdAt?: string;
  decade?: string;
  format?: string;
  hasPeople?: boolean;
  kind?: string;
  location?: string;
  material?: string;
  mediaNumber?: string;
  mongoId?: string;
  nationality?: string;
  people?: string;
  previewUrl?: string;
  productCategory?: string;
  quality?: string;
  season?: string;
  source?: string;
  sourceUrl?: string;
  styles?: string[];
  tags?: string[];
  templates?: string[];
  themeCategory?: string;
  thumbnail?: string;
  type?: string;
  updatedAt?: string;
  version?: number;
  __v?: number;
}

export interface PebMediaSidebarCollectionItem {
  list: PebMediaItem[];
  page: number;
  perPage: number;
  sortedBy: string;
  total: number;
}


export interface PebMediaSidebarCollectionFilters {
  categories?: string[];
  styles?: string[];
  formats?: string[];
  hasPeople?: boolean;
  sortBy?: string;
}

export abstract class PebMediaService {

  abstract getImageCollection(filters: PebMediaSidebarCollectionFilters): Observable<PebMediaSidebarCollectionItem>;

  abstract getVideoCollection(filters: PebMediaSidebarCollectionFilters): Observable<PebMediaSidebarCollectionItem>;

  abstract getCategories(): Observable<string[]>;

  abstract getFormats(): Observable<string[]>;

  abstract getStyles(): Observable<string[]>;

  abstract uploadImage(file: File, container: string): Observable<any>;

  abstract uploadVideo(file: File, container: string): Observable<any>;

}
