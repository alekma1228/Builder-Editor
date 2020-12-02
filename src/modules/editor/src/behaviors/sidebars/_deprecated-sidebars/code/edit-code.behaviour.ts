import { Inject, Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';

import { PebElementDef, PebElementType } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../../../editor.constants';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import { elementOfTypeFocused, onlyOneElementSelected } from '../../../_utils/filters';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../../../services/editor.behaviors';
import { PebEditorCodeSidebarComponent } from './code.sidebar';

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditCode implements PebEditorBehaviourAbstract {
  constructor(
    @Inject(PEB_EDITOR_EVENTS) private events: PebEditorEvents,
    private editor: PebAbstractEditor,
    private editorState: PebEditorState,
    private renderer: PebEditorRenderer,
    private state: PebEditorState,
    private store: PebEditorStore,
  ) {}

  init(): Observable<any> {
    const codeFocused$ = elementOfTypeFocused(
      this.state,
      this.renderer.registry,
      [ PebElementType.Html, PebElementType.Script ],
    );

    return codeFocused$.pipe(
      filter(Boolean),
      switchMap((element: PebEditorElement) => {

        const sidebarCmpRef = this.editor.openSidebar(PebEditorCodeSidebarComponent);
        sidebarCmpRef.instance.element = element.definition;
        sidebarCmpRef.instance.styles = { some: 'foo' };
        sidebarCmpRef.changeDetectorRef.detectChanges();

        return this.editFlow(element, sidebarCmpRef.instance).pipe(
          takeUntil(
            merge(
              codeFocused$.pipe(filter(v => !v)),
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

  editFlow(element: PebEditorElement, sidebar: PebEditorCodeSidebarComponent): Observable<any> {
    return merge(
      sidebar.changeCode.pipe(
        switchMap((definition: PebElementDef) => {
          const code = definition.type === PebElementType.Html
            ? definition.data.innerHTML
            : definition.data.script;
          const data = definition.type === PebElementType.Html
            ? { ...element.definition.data, innerHTML: code }
            : { ...element.definition.data, script: code };
          const newElementDef: PebElementDef = {
            ...element.definition,
            data,
          };

          return this.store.updateElement(newElementDef);
        }),
      ),
    );
  }
}
