import { PebScreen } from '../constants';
import {
  PebAction,
  PebContextSchemaEffect,
  PebEffect,
  PebEffectTarget,
  PebPageEffect,
  PebShopEffect,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '../models/action';
import { PebPage, PebPageVariant, PebShop } from '../models/client';
import { pebGenerateId } from '../utils/generate-id';


export const pebCreatePageInitEffects = (page: PebPage): PebEffect[] => {
  const pageTemplateId = pebGenerateId('template');
  const stylesIds = {
    [PebScreen.Desktop]: pebGenerateId('stylesheet'),
    [PebScreen.Tablet]: pebGenerateId('stylesheet'),
    [PebScreen.Mobile]: pebGenerateId('stylesheet'),
  };
  const pageContextId = pebGenerateId('context');

  return [
    {
      type: PebTemplateEffect.Init,
      target: `${PebEffectTarget.Templates}:${pageTemplateId}`,
      payload: page.template,
    },
    ...Object.values(PebScreen).map(screen => ({
      type: PebStylesheetEffect.Init,
      target: `${PebEffectTarget.Stylesheets}:${stylesIds[screen]}`,
      payload: page.stylesheets[screen],
    })),
    {
      type: PebContextSchemaEffect.Init,
      target: `${PebEffectTarget.ContextSchemas}:${pageContextId}`,
      payload: page.context,
    },
    {
      type: PebPageEffect.Create,
      target: `${PebEffectTarget.Pages}:${page.id}`,
      payload: {
        id: page.id,
        type: page.type,
        variant: page.variant,
        master: page.master,
        name: page.name,
        data: page.data,
        templateId: pageTemplateId,
        stylesheetIds: {
          [PebScreen.Desktop]: `${stylesIds[PebScreen.Desktop]}`,
          [PebScreen.Tablet]: `${stylesIds[PebScreen.Tablet]}`,
          [PebScreen.Mobile]: `${stylesIds[PebScreen.Mobile]}`,
        },
        contextId: `${pageContextId}`,
      },
    },
  ];
}

export const pebCreateShopInitAction = (shop: PebShop): PebAction => {
  const pageEffects = shop.pages.reduce(
    (acc, page) => [...acc,...pebCreatePageInitEffects(page)],
    [] as PebEffect[],
  );

  const shopContextId = pebGenerateId('context');

  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: shop.pages.find(page => page.variant === PebPageVariant.Front).id,
    affectedPageIds: shop.pages.map(page => page.id),
    effects: [
      ...pageEffects,
      {
        type: PebContextSchemaEffect.Init,
        target: `${PebEffectTarget.ContextSchemas}:${shopContextId}`,
        payload: shop.context,
      },
      {
        type: PebShopEffect.Init,
        target: PebEffectTarget.Shop,
        payload: {
          data: shop.data,
          routing: shop.routing,
          contextId: shopContextId,
          pageIds: shop.pages.map(p => p.id),
        },
      },
    ],
  };
};
