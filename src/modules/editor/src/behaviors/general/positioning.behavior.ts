import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { filter, finalize, map, switchMap, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

import { PebElementType, PebScreen, PEB_DESKTOP_CONTENT_WIDTH } from '@pe/builder-core';
import { PebScreenSizes } from '@pe/builder-renderer';

import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { PebEditorState } from '../../services/editor.state';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { fromResizeObserver } from '../_utils/from-resize-observer';
import { PebEditorSectionBordersControl } from '../../controls/section-borders/section-borders.control';
import { PebEditorRenderer } from '../../renderer/editor-renderer';

const PADDINGS_MINIMAL = 40;

@Injectable()
export class PebEditorBehaviorPositioning implements PebEditorBehaviourAbstract {
  // TODO: Probably such info should be set on editor's level
  paddingsSet$ = new Subject<void>();

  constructor(
    private renderer: PebEditorRenderer,
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    ) {}

  init(): Observable<any> {
    return merge(
      this.setContentAreaPaddings,
      this.setRendererWidthOnScreenChange,
      this.placeSectionBorders,
    );
  }

  get setContentAreaPaddings() {
    const contentContainerElement = this.editor.contentContainer.nativeElement;

    return combineLatest([
      fromResizeObserver(contentContainerElement),
      fromResizeObserver(this.renderer.nativeElement),
    ]).pipe(
      throttleTime(0, animationFrame),
      tap(([contentContainerRect, rendererRect]) => {
        this.editor.contentPaddings = {
          vertical: Math.max(PADDINGS_MINIMAL, (contentContainerRect.height - rendererRect.height) / 2),
          horizontal: Math.max(PADDINGS_MINIMAL, (contentContainerRect.width - rendererRect.width) / 2),
        };

        this.paddingsSet$.next();
        this.editor.cdr.detectChanges();
      }),
    );
  }

  get setRendererWidthOnScreenChange() {
    return combineLatest([
      this.state.screen$,
      this.state.scale$,
    ]).pipe(
      tap(([screen, scale]) => {
        this.renderer.nativeElement.style.width = PebScreenSizes[screen] * scale + 'px';
        this.renderer.nativeElement.style.maxWidth = PebScreenSizes[screen] * scale + 'px';
      }),
    )
  }

  get placeSectionBorders() {
    return combineLatest([
      this.state.screen$.pipe(filter(s => s === PebScreen.Desktop)),
      this.paddingsSet$,
    ]).pipe(
      switchMap(() => {
        const bordersRef = this.editor.cfr
          .resolveComponentFactory(PebEditorSectionBordersControl)
          .create(this.editor.injector);

        this.editor.contentContainerSlot.insert(bordersRef.hostView);

        const rendererNode = this.renderer.nativeElement;

        return fromResizeObserver(rendererNode).pipe(
          map(() => rendererNode.getBoundingClientRect()),
          tap((rendererRect) => {
            Object.assign(bordersRef.instance, {
              left: this.editor.contentPaddings.horizontal,
              top: this.editor.contentPaddings.vertical,
              width: rendererRect.width,
              height: rendererRect.height,
              spaceWidth: (rendererRect.width - PEB_DESKTOP_CONTENT_WIDTH * this.state.scale) / 2,
              sectionHeights: this.getSectionHeights()
            });
            bordersRef.changeDetectorRef.detectChanges();
          }),
          takeUntil(
            this.state.screen$.pipe(filter(s => s !== PebScreen.Desktop)),
          ),
          finalize(() => {
            bordersRef.destroy()
          }),
        );
      }),
    )
  }

  private getSectionHeights():number[] {
    const sectionElements = this.renderer.queryElementAll(el => el.element.type === PebElementType.Section)
    .sort((a, b) => a.nativeElement.getBoundingClientRect().y - b.nativeElement.getBoundingClientRect().y);

    const sectionHeights = sectionElements.reduce((acc, el, index) => {
      const prevHeight = acc[index - 1] ?? 0;
      const currHeight = el.nativeElement.getBoundingClientRect().height - 1;
      return [...acc, prevHeight + currHeight];
    }, []);

    sectionHeights.pop();
    return sectionHeights;
  }
}
