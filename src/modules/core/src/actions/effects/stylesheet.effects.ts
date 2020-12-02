import { merge, omit } from 'lodash';

import { PebStylesheetEffect } from '../../models/action';
import { PebElementStyles, PebStylesheet, PebStylesheetId } from '../../models/client';
import { PebElementId } from '../../models/element';

export const pebStylesheetEffectHandlers: {
  [effectName in PebStylesheetEffect]: (
    stylesheet: null | PebStylesheet,
    payload: PebStylesheet | string | StylesReplacePayload,
  ) => PebStylesheet | null
} = {
  [PebStylesheetEffect.Init]: pebStylesheetInitHandler,
  [PebStylesheetEffect.Update]: pebStylesheetUpdateHandler,
  [PebStylesheetEffect.Replace]: pebStylesheetReplaceHandler,
  [PebStylesheetEffect.Delete]: pebStylesheetDeleteHandler,
};

export function pebStylesheetInitHandler(_: null, payload: PebStylesheet): PebStylesheet {
  return payload;
}

export function pebStylesheetUpdateHandler(prevState: PebStylesheet, payload: PebStylesheet): PebStylesheet {
  return merge(
    {},
    prevState,
    payload,
  );
}

interface StylesReplacePayload {
  selector: PebElementId;
  styles: PebElementStyles;
}

export function pebStylesheetReplaceHandler(prevState: PebStylesheet, payload: StylesReplacePayload): PebStylesheet {
  return {
    ...(omit(prevState, [payload.selector])),
    [payload.selector]: payload.styles,
  };
}

export function pebStylesheetDeleteHandler(prevState: PebStylesheet, payload: PebStylesheetId): PebStylesheet {
  if (prevState[payload]) {
    delete prevState[payload];
  }
  return prevState;
}
