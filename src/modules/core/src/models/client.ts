import { PebActionId } from './action';
import { PebShopRoute } from './database';
import { PebElementDef, PebElementType } from './element';

export type PebTemplateId = string;
export interface PebTemplate extends PebElementDef {
  type: PebElementType.Document;
}

export type PebStylesheetId = string;

export interface PebStylesheet {
  [selector: string]: PebElementStyles;
}

export interface PebElementStyles {
  [style: string]: string | number;
  content?: string;
}

export type PebContextSchemaId = string;

// TODO: fix
// export interface ContextSchemaItem {
//   service: string;
//   method: string;
//   params: any[];
// }

export interface PebContextSchema {
  [key: string]: any;
}

export interface PebContext {
  [selector: string]: any;
}

export enum PebPageType {
  Master = 'master',
  Replica = 'replica',
}

export enum PebPageVariant {
  Front = 'front',
  Default = 'default',
  Category = 'category',
  Product = 'product',
}

export type PebPageId = string;
export interface PebPage {
  id: PebPageId;
  name: string;
  variant: PebPageVariant;
  type: PebPageType;
  master: null | {
    id: PebPageId,
    lastActionId: PebActionId,
  };
  data: {
    url?: string;
    mark?: string;
    preview?: string;
  };
  template: PebTemplate;
  stylesheets: {
    [screen: string]: PebStylesheet;
  };
  context: PebContextSchema;
}

export type PebShopId = string;
export interface PebShopData {
  productPages: string, // pattern like "/products/:productId"
  categoryPages: string, // pattern like "/categories/:categoryId"
  [key: string]: any;
}
export interface PebShop {
  id: PebShopId;
  data: PebShopData;
  routing: PebShopRoute[];
  context: PebContextSchema;
  pages: PebPage[];
}

// TODO: move to a more suitable location
export enum ContextService {
  Company = 'company',
  Products = 'products',
}

// TODO: move to a more suitable location
export const CONTEXT_SERVICES = {
  [ContextService.Company]: 'ContextServices.Company',
  [ContextService.Products]: 'ContextServices.Products',
};
