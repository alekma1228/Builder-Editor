import { cloneDeep } from 'lodash';

import { PebElementDef, PebLink } from '@pe/builder-core';

import { PebEditorElementPropertyMenuRoutes } from '../interfaces';
import { PebEditorElement } from '../editor-element';

export class PebEditorElementMenu extends PebEditorElement {
  menuRoutes: PebEditorElementPropertyMenuRoutes;
  originalElementDef: PebElementDef;

  /**
   * Update menu component on user typing.
   *
   * Clone the original element definition, because we cannot directly update target.element
   * as it is being referenced from the snapshot and this will break the undo stack.
   */
  update(value: PebLink[]): void {
    if (!this.originalElementDef) {
      this.originalElementDef = this.target.element;
      this.target.element = cloneDeep(this.originalElementDef);
    }
    this.target.element.data.routes = value;
    this.target.cdr.markForCheck();
  }

  set routes(routes: PebLink[]) {
    if (this.originalElementDef) {
      delete this.originalElementDef;
    }

    this.menuRoutes.initialValue.menuRoutes = routes;
    this.target.element.data.routes = routes;
  }
}
