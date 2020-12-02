import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { PebElementId, PebElementType } from '@pe/builder-core';

import { PebEditorState } from '../../services/editor.state';
import { PebEditorElement } from '../../renderer/editor-element';

export const filterAnd = (...predicates) => (evt) => {
  return predicates
    .filter((predicate) => !predicate(evt))
    .length === 0;
};

export const filterOr = (...predicates) => (evt) => predicates
  .map((predicate) => Boolean(predicate(evt)))
  .includes(true);

export const filterNot = (predicate) => (evt) => !predicate(evt);


export function elementOfTypeFocused(
  state: PebEditorState,
  registry: {
    get: (id: PebElementId) => PebEditorElement;
  },
  elementTypes: PebElementType[],
): Observable<PebEditorElement | null> {
  return state.selectedElements$.pipe(
    map((selectedIds: PebElementId[]) => {
      if (selectedIds.length !== 1) {
        return null;
      }

      const el = registry.get(selectedIds[0]);

      if (!el) {
        return null;
      }

      const isType = elementTypes.includes(el.definition.type);
      return isType ? el : null;
    }),
  );
}

export function onlyOneElementSelected(state: PebEditorState) {
  return state.selectedElements$.pipe(filter(ids => !ids.length || ids.length > 1))
}

export enum MouseKey {
  Primary = 1,
  Secondary = 2,
  Auxiliary = 4,
  Fourth = 8, // browser back
  Fifth = 16, // browser forward
}

// tslint:disable-next-line:no-bitwise
export const mouseKeyFilter = (mouseKey: MouseKey) => (evt: MouseEvent) => evt.buttons & mouseKey;

export const onlyMouseKeyFilter = (mouseKey: MouseKey) => (evt: MouseEvent) => evt.buttons === mouseKey;

