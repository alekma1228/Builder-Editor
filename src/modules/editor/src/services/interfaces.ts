import {
  PebContextSchema,
  PebElementDef,
  PebElementId,
  PebElementStyles,
  PebPageId,
  PebShopThemeSnapshot,
} from '@pe/builder-core';

export interface PebElementKit {
  element: PebElementDef;
  styles: { [screenId: string]: PebElementStyles };
  contextSchema: PebContextSchema;
  prevId?: PebElementId;
  rootContextKey?: string;
}

export interface PebDeleteElement {
  element: PebElementDef;
  styles: { [screenId: string]: PebElementStyles };
  contextSchema: PebContextSchema;
}

export interface PebPasteElement {
  parentId: PebElementId;
  elementDef: PebElementKit;
  childIds?: PebElementId[];
  beforeId?: PebElementId;
}

export interface PebActionResponse {
  snapshot: PebShopThemeSnapshot;
  progress: number;
}

export interface PebChangeShopRouting {
  currentUrl: string;
  pageId: PebPageId;
}
