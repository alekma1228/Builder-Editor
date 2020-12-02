import { Inject, Injectable, Injector } from '@angular/core';
import { combineLatest, EMPTY, fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, repeat, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';

import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { PebEditorState } from '../../services/editor.state';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../services/editor.behaviors';
import { PebEditorStore } from '../../services/editor.store';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorElementEdgesControl } from '../../controls/element-edges/element-edges.control';
import { PebEditorElementAnchorsControl } from '../../controls/element-anchors/element-anchors.control';
import { fromResizeObserver } from '../_utils/from-resize-observer';
import { PebEditorRenderer } from '../../renderer/editor-renderer';

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorMarkHovered implements PebEditorBehaviourAbstract {
  constructor(
    private store: PebEditorStore,
    private state: PebEditorState,
    private editor: PebAbstractEditor,
    private renderer: PebEditorRenderer,
    @Inject(PEB_EDITOR_EVENTS) private events: PebEditorEvents,
  ) {}

  init(): Observable<any> {
    return merge(
      this.detectHoveredElement,
      this.showHoveredBorders,
    );
  }

  get detectHoveredElement(): Observable<any> {
    return merge(
      this.events.contentContainer.mousemove$.pipe(
        tap((evt: MouseEvent) => {
          const elementCmp = this.renderer.getElementComponentAtEventPoint(evt)
          const newHoveredId = elementCmp ? elementCmp.definition.id : null;

          if (this.state.hoveredElement !== newHoveredId) {
            this.state.hoveredElement = newHoveredId;
          }
        }),
      ),
    ).pipe(
      finalize(() => this.state.hoveredElement = null),
    );
  }

  get showHoveredBorders(): Observable<any> {
    return combineLatest([
      this.state.hoveredElement$.pipe(filter(v => Boolean(v))),
      this.state.selectedElements$,
    ]).pipe(
      filter(([hovId, selIds]) => !selIds.includes(hovId)),
      switchMap(([hoveredId]) => {
        const hoveredCmp = this.renderer.registry.get(hoveredId);
        if (!hoveredCmp) {
          // TODO: At certain point this thrown an error. Should be investigated.
          // debugger;
          return EMPTY;
        }

        const hoveredNode = hoveredCmp.nativeElement;

        const bordersControl = PebEditorElementEdgesControl.construct(this.editor, hoveredCmp);
        const anchorsRef = PebEditorElementAnchorsControl.construct(this.editor, hoveredCmp);

        return fromResizeObserver(hoveredNode).pipe(
          startWith(null as object),
          map(() => hoveredNode.getBoundingClientRect()),
          distinctUntilChanged(isEqual),
          tap(() => {
            bordersControl.instance.detectChanges();
            anchorsRef.instance.selected = false;
            anchorsRef.instance.detectChanges();
          }),
          takeUntil(merge(
            this.state.selectedElements$.pipe(filter(selIds => selIds.includes(hoveredId))),
            this.state.hoveredElement$.pipe(filter(id => id !== hoveredId)),
          )),
          finalize(() => {
            if (hoveredCmp.controls.edges === bordersControl) {
              hoveredCmp.controls.edges = null;
            }
            if (hoveredCmp.controls.anchors === anchorsRef) {
              hoveredCmp.controls.anchors = null;
            }
            bordersControl.destroy();
            anchorsRef.destroy();

          }),
        );
      }),
      repeat(),
    )
  }
}
