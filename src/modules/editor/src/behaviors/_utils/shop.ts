import { forEach } from 'lodash';
import { EMPTY, Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import {
  PebAction,
  PebElementDef,
  PebElementId,
  PebPageShort,
  PebShopEffect,
  pebTraverseElementDeep,
} from '@pe/builder-core';

import { PageSnapshot, PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorState } from '../../services/editor.state';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorElement } from '../../renderer/editor-element';

export function getUndoSourceActions(
  actions: PebAction[],
  activePage: PebPageShort,
): {
  actions: PebAction[],
  removedAction: PebAction,
} {
  const activePageId = activePage.id;
  const pageTargets = [ activePageId ];
  forEach(activePage.stylesheetIds, (styleId) => pageTargets.push(styleId));

  const pageActions = actions.filter((action: PebAction) => {
    const isInitAction = action.effects.findIndex((effect) => effect.type === PebShopEffect.Init);
    if (isInitAction === -1) {
      // Only if action don't contain 'shop:init' effect type
      const effects: string[] = action.effects.map((effect) => effect.target);
      return effects.filter((effect) => !!pageTargets.find((target: string) => effect.includes(target))).length;
    }
  });

  const lastAction = pageActions.length ? pageActions[pageActions.length - 1] : null;
  const returnValue = {
    actions: [],
    removedAction: null,
  };
  if (lastAction) {
    // Find index of last action related active page
    const lastActIndex = actions.findIndex((act) => act.id === lastAction.id);
    // Remove last action related active page
    returnValue.removedAction = actions[lastActIndex];
    actions.splice(lastActIndex, 1);
    returnValue.actions = actions;
  }

  return returnValue;
}

// When we define parent element into which new element will be appended to, we should traverse
// elements tree till we encounter element that can actually be a parent (ie: logo element can't
// have children inside it)
export function getNextParentElement(
  state: PebEditorState,
  renderer: PebEditorRenderer,
  editor: PebAbstractEditor,
  selectedElementId?: PebElementId,
): Observable<PebEditorElement> {
  let selIds = state.selectedElements;
  if (!selIds.length) {
    // Get id of first children element
    const children = renderer.element.children;
    selIds = children && children.length ? [ renderer.element.children[0].id ] : [];
  }
  if (selIds.length !== 1 && !selectedElementId) {
    alert('You should have only one selected element');
    return EMPTY;
  }
  const selectedElId = selectedElementId || selIds[0];
  let nextParentElement = renderer.registry.get(selectedElId);

  if (!nextParentElement.isParent) {
    return editor.activePageSnapshot$.pipe(
      take(1),
      map((snapshot: PageSnapshot) => {
        while (nextParentElement && !nextParentElement.isParent) {
          let parentElementId = '';
          pebTraverseElementDeep(
            snapshot.template,
            el => {
              parentElementId = isParentElement(el, selectedElId) ? el.id : parentElementId;
            },
          );
          nextParentElement = renderer.registry.get(parentElementId);
        }
        return nextParentElement;
      }),
    );
  }
  return of(nextParentElement);
}

export function isParentElement(element: PebElementDef, id: string): boolean {
  return element.children && element.children.map((child) => child.id).includes(id);
}
