import { Inject, Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { combineLatest, EMPTY, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, repeat, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateLogger } from '@pe/builder-core';

import { PebEditorElementEdgesControl } from '../../controls/element-edges/element-edges.control';
import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../services/editor.behaviors';
import { PebEditorState } from '../../services/editor.state';
import { fromResizeObserver } from '../_utils/from-resize-observer';
import { PebEditorElementAnchorsControl } from '../../controls/element-anchors/element-anchors.control';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorSectionLabelsControl } from '../../controls/section-labels/section-labels.control';

const log = pebCreateLogger('editor:behaviors:mark-selected');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorMarkSelectedElement implements PebEditorBehaviourAbstract {
  constructor(
    @Inject(PEB_EDITOR_EVENTS) private events: PebEditorEvents,
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
  ) {}

  init(): Observable<any> {
    return merge(
      this.detectSelectedElement,
      this.showSelectedBorders,
    );
  }

  get detectSelectedElement(): Observable<any> {
    return merge(
      this.events.contentContainer.mousedown$.pipe(
        tap((evt: MouseEvent) => {
          const anchor = this.renderer.getAddSectionElementIdAtEventPoint(evt);
          if (anchor) {
            return;
          }
          const selectedCmp = this.renderer.getElementComponentAtEventPoint(evt);
          const newSelectedIds = selectedCmp ? [selectedCmp.definition.id] : [];
          const newSelectedElementsIds = [...newSelectedIds];
          log('set selected', newSelectedElementsIds);
          if (evt.shiftKey || evt.metaKey || evt.ctrlKey) {
            newSelectedElementsIds.push(...this.state.selectedElements);
          }

          if (!isEqual(this.state.selectedElements, newSelectedElementsIds)) {
            this.state.selectedElements = newSelectedElementsIds;
          }
        }),
      ),
    ).pipe(
      finalize(() => this.state.hoveredElement = null),
    );
  }

  get showSelectedBorders(): Observable<any> {
    return this.state.selectedElements$.pipe(
      filter(selectedIds => selectedIds.length > 0),
      switchMap((selectedIds) => {
        const fromResizeObservers = selectedIds.map((selectedId) => {
          const elementCmp = this.renderer.getElementComponent(selectedId);

          if (!elementCmp) {
            // TODO: Check this
            // The element or parent of element has display: none style
            this.state.selectedElements = [];
            return EMPTY;
          }

          const elementNode = elementCmp.nativeElement;

          if (!this.isVisibleElement(elementNode)) {
            elementNode.scrollIntoView({ behavior: 'smooth' });
          }

          const edgesRef = PebEditorElementEdgesControl.construct(this.editor, elementCmp);
          const anchorsRef = PebEditorElementAnchorsControl.construct(this.editor, elementCmp);
          const labelsRef = PebEditorSectionLabelsControl.construct(this.editor, elementCmp);

          edgesRef.instance.type = 'selected';
          edgesRef.instance.detectChanges();


          return fromResizeObserver(elementNode).pipe(
            startWith(null as object),
            map(() => elementNode.getBoundingClientRect()),
            distinctUntilChanged(isEqual),
            tap((elementDs) => {
              edgesRef.instance.detectChanges();
              anchorsRef.instance.detectChanges();
              labelsRef?.instance.detectChanges();
            }),
            takeUntil(
              this.state.selectedElements$.pipe(filter(ids => !ids.length)),
            ),
            finalize(() => {
              if (elementCmp.controls.edges === edgesRef) {
                elementCmp.controls.edges = null;
              }
              if (elementCmp.controls.anchors === anchorsRef) {
                elementCmp.controls.anchors = null;
              }
              if (elementCmp.controls.labels === labelsRef) {
                elementCmp.controls.labels = null;
              }

              edgesRef.destroy();
              anchorsRef.destroy();
              labelsRef?.destroy();
            }),
          );
        });

        return combineLatest(fromResizeObservers);
      }),
      repeat(),
    )
  }

  private isVisibleElement(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const elemTop = rect.top;
    const elemBottom = rect.bottom;

    const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
  }

}
