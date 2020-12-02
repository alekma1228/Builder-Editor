import { cloneDeep, mapKeys, mapValues } from 'lodash';

import { PebContextSchema, PebShop, PebStylesheet, PebTemplate } from '../models/client';
import { PebShopRoute } from '../models/database';
import { pebGenerateId } from '../utils/generate-id';
import { PebElementId, PebElementType } from '../models/element';
import { pebFindElementsDeep, pebMapElementDeep } from '../utils/element-utils';

const usedByElements = {
  '#logo': [ PebElementType.Logo ],
}

export function pebCloneShopTheme(proto: PebShop): PebShop {
  const result = cloneDeep(proto);

  const pageMappings = proto.pages.reduce(
    (acc, page) => {
      acc.set(page.id, pebGenerateId());
      return acc;
    },
    new Map<PebElementId, PebElementId>(),
  );

  const pages = result.pages.map(({ id: oldPageId, ...pageData }) => ({
    id: pageMappings.get(oldPageId),
    ...pageData,
    ...generateUniqueIds(pageData),
  }));

  Object.keys(result.context).forEach(key => {
    if (!usedByElements[key]) {
      return;
    }

    const elements = pages.reduce((acc, page) =>
      ([
        ...acc,
        ...pebFindElementsDeep(page.template, e => !!usedByElements[key].find((t: PebElementType) => t === e.type)),
      ]),
    []);

    result.context[key].usedBy = elements.map(el => el.id)
  })

  const routing = result.routing.map((route: PebShopRoute) => {
    const pageId = pageMappings.get(route.pageId);
    return {
      routeId: route.routeId,
      url: route.url,
      pageId,
    }
  })

  return { ...result, routing, pages };
}

interface PageDef {
  template: PebTemplate;
  stylesheets: {
    [screen: string]: PebStylesheet;
  };
  context: PebContextSchema;
}

export function generateUniqueIds(page: PageDef): PageDef  {
  const elementMappings = new Map<PebElementId, PebElementId>();

  const template = pebMapElementDeep(page.template, ({ id: oldId, ...rest }) => {
    const newId = pebGenerateId();

    elementMappings.set(oldId, newId);

    return { id: newId, ...rest }
  }) as PebTemplate;

  const stylesheets = mapValues(
    page.stylesheets,
    stylesheet => mapKeys(stylesheet, (val, oldId) => elementMappings.get(oldId)),
  );

  const context = mapKeys(page.context, (val, oldId) => elementMappings.get(oldId));

  return { template, stylesheets, context };

  // // DevOnly
  // return page;
}
