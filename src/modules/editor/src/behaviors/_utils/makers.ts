import { ComponentRef, Injector } from '@angular/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PebAbstractElement } from '@pe/builder-renderer';

import { PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorElementAnchorsControl } from '../../controls/element-anchors/element-anchors.control';
import { PebEditorElementEdgesControl } from '../../controls/element-edges/element-edges.control';
import { PebAbstractMaker } from '../../makers/abstract-maker';
import { Axis, PebEditorElement } from '../../renderer/editor-element';
import { PebEditorRenderer } from '../../renderer/editor-renderer';

export function replaceElementWithMaker(
  element: PebEditorElement,
  editor: PebAbstractEditor,
  renderer: PebEditorRenderer,
  makers: any,
  sidebar: any,
  scale: number,
): ComponentRef<PebAbstractElement> {

  if (!element?.textContent) {
    console.error(`
      There is no textContent getter in element
        id: ${element.definition.id}
        type: ${element.definition.type}
    `)
    return null;
  }

  const initialRect = element.textContent.getBoundingClientRect();

  const makerComponent = makers[element.definition.type];
  const cmpFactory = editor.cfr.resolveComponentFactory<PebAbstractElement>(makerComponent);
  const cmpInjector = Injector.create({
    parent: editor.injector,
    providers: [
      { provide: PebEditorRenderer, useValue: renderer },
    ],
  });

  const makerCmpRef = cmpFactory.create(cmpInjector) as ComponentRef<PebAbstractMaker | any>;

  makerCmpRef.instance.element = element.definition;
  makerCmpRef.instance.sidebarRef = sidebar;
  makerCmpRef.instance.initialRect = initialRect;

  const horizontalPossibleDimensions = element.getMaxPossibleDimensions(Axis.Horizontal);
  const verticalPossibleDimensions = element.getMaxPossibleDimensions(Axis.Vertical);

  makerCmpRef.instance.limits = {
    width: (horizontalPossibleDimensions.size - horizontalPossibleDimensions.spaceStart) * scale,
    height: (verticalPossibleDimensions.size - verticalPossibleDimensions.spaceStart) * scale,
  };

  renderer.setMaker(makerCmpRef);

  // const anchorsControl = editor.createControl(PebEditorElementAnchorsControl);
  // anchorsControl.instance.component = makerCmpRef.instance as any;
  // makerCmpRef.instance.controlsSlot.insert(anchorsControl.hostView);
  // anchorsControl.instance.detectChanges();

  const edgesControl = editor.createControl(PebEditorElementEdgesControl);
  edgesControl.instance.component = makerCmpRef.instance as any;
  makerCmpRef.instance.controlsSlot.insert(edgesControl.hostView);
  edgesControl.instance.detectChanges();

  // TODO: Change to observable
  merge(makerCmpRef.instance.changes).pipe(
    tap(() => {
      // anchorsControl.instance.detectChanges();
      edgesControl.instance.detectChanges();
    }),
  ).subscribe()

  return makerCmpRef;
}
