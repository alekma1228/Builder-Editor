import { Component, EventEmitter, Input, Output } from '@angular/core';
import { capitalize } from 'lodash';

import { PebElementDef, PebStylesheet } from '@pe/builder-core';

import { PebEditorState } from './../../../../services/editor.state';
import { AbstractComponent } from '../../../../misc/abstract.component';

const nameOverrides = {
  'shop-cart': 'Cart',
  'shop-products': 'Product',
  'shop-product-details': 'Product Details',
};

@Component({
  selector: 'peb-editor-documents-sidebar',
  templateUrl: 'documents.sidebar.html',
  styleUrls: [
    './documents.sidebar.scss',
    '../sidebars.scss',
  ],
})
export class PebEditorDocumentsSidebarComponent extends AbstractComponent {

  @Input() element: PebElementDef;
  @Input() stylesheet: PebStylesheet;

  @Output() changeElementVisible = new EventEmitter();

  openedElements = {};


  constructor(
    private state: PebEditorState,
  ) {
    super();
  }

  onSelectElement(element: PebElementDef) {
    this.openedElements[element.id] = !this.openedElements[element.id];

    this.state.selectedElements = [element.id];
  }

  getElementName(element: PebElementDef) {
    return nameOverrides[element.type] || capitalize(element.type)
  }

  checkElementIsVisible(element: PebElementDef): boolean {
    const styles = this.stylesheet[element.id];

    if (!styles) {
      return;
    }

    return styles?.display !== 'none';
  }

  toggleVisible(event: MouseEvent, element: PebElementDef) {
    event.stopPropagation();

    this.changeElementVisible.emit({ element, visible: !this.checkElementIsVisible(element) })
  }
}
