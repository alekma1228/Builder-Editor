import { PebPageVariant, PebElementStyles } from './client';
import { PebInteractionType } from '../utils/interactions';

export type PebElementId = string;

export enum PebElementType {
  Document = 'document',
  Section = 'section',
  Block = 'block',
  Text = 'text',
  Image = 'image',
  Button = 'button',
  Cart = 'shop-cart',
  Shape = 'shape',
  Carousel = 'carousel',
  Logo = 'logo',
  Line = 'line',
  Html = 'html',
  Script = 'script',
  Video = 'video',
  Menu = 'menu',
  ProductDetails = 'shop-product-details',
  Products = 'shop-products',
  ProductCatalog = 'shop-category',
}

export enum PebMakerType {
  Text = 'text',
}

export interface PebElementDef {
  id: PebElementId;
  type: PebElementType;
  children?: PebElementDef[] | null;
  data?: PebElementDefData;
  meta?: PebElementDefMeta;
}

/** @description use PebInteraction instead */
export interface PebLink {
  type: PebInteractionType,
  value: string,
  variant?: PebPageVariant,
  title?: string,
  newTab?: boolean,
}

export interface PebElementDefData {
  text?: string;
  routes?: PebLink[];
  [others: string]: any;
}

export interface PebElementDefMeta {
  deletable: boolean;
}

export interface PebElementWithParent extends PebElementDef {
  priority: number;
  parentId: string | null;
}

export enum PebSectionType {
  Header = 'header',
  Body = 'body',
  Footer = 'footer',
}

export enum PebElementContextState {
  Loading = 'loading',
  Error = 'error',
  Ready = 'ready',
  Empty = 'empty',
}

export interface PebElementContext<T> {
  state: PebElementContextState;
  data: T;
  styles?: PebElementStyles;
}
