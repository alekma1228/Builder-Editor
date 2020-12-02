import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { debounceTime, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';

import { PebElementDef, PebElementType } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../../../editor.constants';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import { elementOfTypeFocused, onlyOneElementSelected } from '../../../_utils/filters';
import { PebEditorMenuSidebarComponentOld } from './menu.sidebar';

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditMenuOld implements PebEditorBehaviourAbstract {
  constructor(
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
    private store: PebEditorStore,
  ) {}

  init(): Observable<any> {
    const menuFocused$ = elementOfTypeFocused(this.state, this.renderer.registry, [ PebElementType.Menu ]);

    return menuFocused$.pipe(
      filter(Boolean),
      switchMap((element: PebEditorElement) => {
        const sidebarCmpRef = this.editor.openSidebar(PebEditorMenuSidebarComponentOld);
        sidebarCmpRef.instance.element = element.definition;
        sidebarCmpRef.instance.styles = element.styles;
        sidebarCmpRef.changeDetectorRef.detectChanges();

        return this.editFlow(element, sidebarCmpRef.instance).pipe(
          takeUntil(
            merge(
              menuFocused$.pipe(filter(v => !v)),
              onlyOneElementSelected(this.state),
            ),
          ),
          finalize(() => {
            sidebarCmpRef.destroy();
          }),
        );
      }),
    );
  }

  editFlow(element: PebEditorElement, sidebar: PebEditorMenuSidebarComponentOld): Observable<any> {
    return merge(
      sidebar.changeStyle.pipe(
        filter(style => !isEqual(element.styles, { ...element.styles, ...style })),
        map(style => ({ ...element.styles, ...style})),
        tap(style => {
          element.styles = { ...element.styles, ...style };
          sidebar.styles = element.styles;
          // widget.cdr.markForCheck();
        }),
        debounceTime(500),
        switchMap(() => {
          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: element.styles,
          });
        }),
      ),
      sidebar.changeData.pipe(
        filter(data => !isEqual(element.definition.data, { ...element.definition.data, ...data })),
        switchMap(data => {
          const newElementDef: PebElementDef = {
            ...element.definition,
            data: {
              ...element.definition.data,
              ...data,
            },
          };

          element.definition.data = newElementDef.data;
          // widget.cdr.markForCheck();
          return this.store.updateElement(newElementDef);
        }),
      ),
    );
  }
}
