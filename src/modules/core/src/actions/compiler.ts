import { omit } from 'lodash';

import { PebAction, PebEffectTarget } from '../models/action';
import { PebShopThemeSnapshot } from '../models/database';
import { pebContextSchemaEffectHandlers } from './effects/context-schema.effects';
import { pebPageEffectHandler } from './effects/page.effects';
import { pebShopEffectHandlers } from './effects/shop.effects';
import { pebStylesheetEffectHandlers } from './effects/stylesheet.effects';
import { pebLayoutEffectHandlers } from './effects/template.effects';

export const createInitialShopSnapshot = (): PebShopThemeSnapshot => ({
  // TODO: is hash needed???
  id: null,
  hash: null,
  shop: null,
  pages: {},
  templates: {},
  stylesheets: {},
  contextSchemas: {},
});

const effectHandlers = {
  ...pebShopEffectHandlers,
  ...pebPageEffectHandler,
  ...pebLayoutEffectHandlers,
  ...pebStylesheetEffectHandlers,
  ...pebContextSchemaEffectHandlers,
};

export function pebActionHandler(snapshot: PebShopThemeSnapshot, action: PebAction): PebShopThemeSnapshot {
  const result = action.effects.reduce((prevState, effect) => {
    const [areaName, areaId] = effect.target.split(':');
    const handler = effectHandlers[effect.type];

    if (!handler) {
      throw new Error('Invalid effect type');
    }

    const collectionNames = Object.values(PebEffectTarget) as string[];

    // TODO: Check if Maps are deeply copied
    if (areaName === PebEffectTarget.Shop) {
      // debugger;
      return {
        ...prevState,
        shop: handler(prevState.shop as any, effect.payload),
      } as any; // FIXME: Type??
    }

    if (collectionNames.includes(areaName)) {
      const prevUnit = prevState[areaName][areaId] || null;
      const nextUnit = handler(prevUnit, effect.payload);

      const nextArea = Boolean(nextUnit)
        ? { ...prevState[areaName], [areaId]: nextUnit }
        : omit(prevState[areaName], areaId) as any;

      return {
        ...prevState,
        [areaName]: nextArea,
      };
    }

    throw new Error('Invalid effect target');
  }, snapshot);

  const { id, hash, ...inputAreas } = result;

  return {
    id,
    hash: hashObject(inputAreas),
    ...inputAreas,
  };
}

export const pebCompileActions = (actions: PebAction[]): PebShopThemeSnapshot =>
  actions.reduce(pebActionHandler, createInitialShopSnapshot());

export function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    /* tslint:disable:no-bitwise */
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
    /* tslint:enable:no-bitwise */
  }
  return Math.abs(hash).toString(16).slice(-16).padStart(8, '0');
}

export function hashObject(obj: object) {
  return hashString(JSON.stringify(obj));
}
