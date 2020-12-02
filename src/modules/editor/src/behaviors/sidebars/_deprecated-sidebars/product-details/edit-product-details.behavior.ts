import { Injectable, Injector, Type } from '@angular/core';
import { merge, Observable } from 'rxjs';
import {
  debounceTime,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';

import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import { PebEditorProductDetailsSidebarComponent } from './product-details.sidebar';
import { AbstractEditElementWithSidebar } from '../../_sidebar.behavior';

const log = pebCreateLogger('editor:behaviors:edit-product-details');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditProductDetails
  extends AbstractEditElementWithSidebar<PebEditorProductDetailsSidebarComponent> {

  logger = { log };

  sidebarComponent = PebEditorProductDetailsSidebarComponent;

  constructor(
    injector: Injector,
    public editor: PebAbstractEditor,
    public state: PebEditorState,
    public renderer: PebEditorRenderer,
    public store: PebEditorStore,
  ) {
    super(injector);
  }

  init(): Observable<PebEditorElement> {
    const productPageFocused$ = this.state.selectedElements$.pipe(
      map((selectedIds) => {
        if (selectedIds.length !== 1) {
          return false;
        }

        const element = this.renderer.registry.get(selectedIds[0]);

        if (!element) {
          return false;
        }

        return element.definition.type === 'shop-product-details' as PebElementType
          ? element
          : false;
      }),
    );

    return productPageFocused$.pipe(
      filter(Boolean),
      switchMap((element: PebEditorElement) => {
        const sidebarCmpRef = this.editor.openSidebar(this.sidebarComponent);
        sidebarCmpRef.instance.component = element;
        sidebarCmpRef.instance.element = element.definition;
        sidebarCmpRef.instance.styles = element.styles;
        sidebarCmpRef.changeDetectorRef.detectChanges();

        this.initBackgroundForm(element);

        return merge(
          this.editFlow(element, sidebarCmpRef.instance),
          this.handleBackgroundForm(element, sidebarCmpRef),
        )
          .pipe(
          takeUntil(productPageFocused$.pipe(filter(v => !v))),
          finalize(() => {
            sidebarCmpRef.destroy();
          }),
        );
      }),
    );
  }

  editFlow(
    element: PebEditorElement,
    sidebar: PebEditorProductDetailsSidebarComponent,
  ): Observable<any> {
    return merge(
      sidebar.changeStyle.pipe(
        tap((style) => {
          element.styles = { ...element.styles, ...style };
          sidebar.styles = element.styles;
        }),
        debounceTime(500),
        switchMap(() => {
          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: element.styles,
          });
        }),
      ),
    );
  }
}
