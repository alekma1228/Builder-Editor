import { PebPageEffect } from '../../models/action';
import { PebPageShort } from '../../models/editor';

export const pebPageEffectHandler: {
  [effectName in PebPageEffect]: (page: null | PebPageShort, payload: any) => PebPageShort | null
} = {
  [PebPageEffect.Create]: pebPageEffectCreateHandler,
  [PebPageEffect.Update]: pebPageEffectUpdateHandler,
  [PebPageEffect.Delete]: pebPageEffectDeleteHandler,
};

export function pebPageEffectCreateHandler(_: null, payload: PebPageShort): PebPageShort {
  return payload;
}

export function pebPageEffectUpdateHandler(prevPage: PebPageShort, payload: any): PebPageShort {
  return {
    ...prevPage,
    name: payload.name ? payload.name : prevPage.name,
    variant: payload.variant ? payload.variant : prevPage.variant,
    data: {
      ...prevPage.data,
      ...payload.data,
    },
  };
}

export function pebPageEffectDeleteHandler(prevPage: PebPageShort, payload: any): null {
  return null;
}
