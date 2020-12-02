import { PebAction } from './action';
import { PebContextSchema, PebContextSchemaId, PebPage, PebPageId, PebShop, PebShopId, PebStylesheet, PebTemplate } from './client';
import {
  PebPageShort,
  PebShopThemeId,
  PebShopThemeSourceId,
  PebShopThemeVersionId,
} from './editor';

//
// Data structures required by editor
//
export interface PebShopThemeEntity {
  id: PebShopThemeId;
  name: string;
  picture: string;
  sourceId: PebShopThemeSourceId;
  versionsIds: PebShopThemeVersionId[];
  publishedId: null | PebShopThemeVersionId;
}

export interface PebShopThemeVersionEntity {
  id: PebShopThemeVersionId;
  name: string;
  sourceId: PebShopThemeSourceId;
  result: PebShop;
  createdAt: Date;
  published: boolean;
  description: string;
}


export interface PebShopThemeSourceEntityOld {
  id: PebShopThemeSourceId;
  hash: string;
  actions: PebAction[];
  snapshotId: string;
  previews: PebShopThemeSourcePagePreviews;
}

//
// Data required by shop client to actually render shop
//
export interface PebShopRoute {
  routeId: string;
  url: string;
  pageId: PebPageId;
}

export interface PebShopEntity {
  id: PebShopId;
  frontPage: PebPageId;
  routing: PebShopRoute[];
  contextId: PebContextSchemaId;
  pages: PebPageId[];
}

export type PebPageEntity = PebPage;

export interface PebShopImageResponse {
  blobName: string;
  brightnessGradation: string;
  preview: string
}

export interface PebShopGeneratedThemeResponse {
  category: string;
  page: string;
  theme: string;
  themeId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** NEW INTERFACES */
export interface PebShopThemeSnapshot {
  id: string;
  hash: string;
  shop: PebShopEntity;
  pages: {
    [pageId: string]: PebPageShort,
  };
  templates: {
    [templateId: string]: PebTemplate,
  };
  stylesheets: {
    [stylesheetId: string]: PebStylesheet,
  };
  contextSchemas: {
    [contextSchemaId: string]: PebContextSchema,
  };
}

export interface PebShopThemeSourcePagePreviews {
  [pageId: string]: {
    actionId: string;
    previewUrl: string;
  };
}

export interface ThemeVersionInterface {
  description: string;
  published: boolean;
  source: ThemeSourceInterface;
  name: string;
  createdAt: Date;
}

export enum PebThemeType {
  Template = 'template',
  Application = 'application',
}

export interface PebTheme {
  id: string;
  type: PebThemeType;
  isDefault?: boolean;
  name: string;
  picture: string;
  source: ThemeSourceInterface;
  versions: ThemeVersionInterface[];
  publishedVersion?: ThemeVersionInterface;
}

export interface ThemeSourceInterface {
  id: string;
  hash: string;
  previews: PebShopThemeSourcePagePreviews;
  snapshot: string;
}
