import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { debounceTime, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebCarouselElement } from '@pe/builder-renderer';

import { PebEditorBehaviourAbstract } from '../../../../editor.constants';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import { elementOfTypeFocused, onlyOneElementSelected } from '../../../_utils/filters';
import { PebEditorCarouselSidebarComponent } from './carousel.sidebar';

@Injectable({providedIn: 'any'})
export class PebEditorBehaviorEditCarousel implements PebEditorBehaviourAbstract {
  constructor(
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
    private store: PebEditorStore,
  ) {}

  init(): Observable<any> {
    const carouselFocused$ = elementOfTypeFocused(this.state, this.renderer.registry, [ PebElementType.Carousel ]);

    return carouselFocused$.pipe(
      filter(Boolean),
      switchMap((element: PebEditorElement) => {
        const sidebarCmpRef = this.editor.openSidebar(PebEditorCarouselSidebarComponent);
        sidebarCmpRef.instance.element = element.definition;
        sidebarCmpRef.instance.styles = element.styles;
        sidebarCmpRef.changeDetectorRef.detectChanges();

        return this.editFlow(element, sidebarCmpRef.instance, element.target as PebCarouselElement).pipe(
          takeUntil(
            merge(
              carouselFocused$.pipe(filter(v => !v)),
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

  editFlow(
    element: PebEditorElement,
    sidebar: PebEditorCarouselSidebarComponent,
    widget: PebCarouselElement,
  ): Observable<any> {
    return merge(
      sidebar.changeStyles.pipe(
        tap(styles => {
          element.styles = {
            ...element.styles,
            ...styles,
          };
          element.applyStyles();
        }),
        debounceTime(500),
        switchMap(styles => this.store.updateStyles(this.state.screen, {
            [element.definition.id]: styles,
        })),
      ),
      sidebar.changeData.pipe(
        switchMap(data => {
          const newElementDef: PebElementDef = {
            ...element.definition,
            data: {
              ...element.definition.data,
              ...data,
            },
          };

          element.detectChanges();
          return this.store.updateElement(newElementDef);
        }),
      ),
      sidebar.changeSlide.pipe(
        tap(slideIndex => {
          widget.currentSlide = slideIndex;
          widget.cdr.detectChanges();
        }),
      ),
    );
  }
}
