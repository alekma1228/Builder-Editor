import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { debounceTime, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElementType } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../../../editor.constants';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import { elementOfTypeFocused, onlyOneElementSelected } from '../../../_utils/filters';
import { PebEditorLineSidebarComponent } from './line.sidebar';

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditLine implements PebEditorBehaviourAbstract {
  constructor(
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
    private store: PebEditorStore,
  ) {}

  init(): Observable<any> {
    const lineFocused$ = elementOfTypeFocused(this.state, this.renderer.registry, [ PebElementType.Line ]);

    return lineFocused$.pipe(
      filter(Boolean),
      switchMap((element: PebEditorElement) => {

        const sidebarCmpRef = this.editor.openSidebar(PebEditorLineSidebarComponent);
        sidebarCmpRef.instance.element = element.definition;
        sidebarCmpRef.instance.styles = element.styles;
        sidebarCmpRef.changeDetectorRef.detectChanges();

        return this.editFlow(element, sidebarCmpRef.instance).pipe(
          takeUntil(
            merge(
              lineFocused$.pipe(filter(v => !v)),
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

  editFlow(element: PebEditorElement, sidebar: PebEditorLineSidebarComponent): Observable<any> {
    return merge(
      sidebar.changeStyle.pipe(
        tap(styles => {
          element.styles = { ...element.styles, ...styles };
        }),
        debounceTime(500),
        switchMap(() => {
          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: element.styles,
          });
        }),
      ),
      sidebar.changeStroking.pipe(
        switchMap(() => {
          element.styles.stroking = element.styles.stroking ? 0 : 1;

          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: { ...element.styles },
          });
        }),
      ),
      sidebar.changeShadowing.pipe(
        switchMap(() => {
          element.styles.shadowing = element.styles.shadowing ? 0 : 1;

          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: { ...element.styles },
          });
        }),
      ),
    );
  }
}
