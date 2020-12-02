import { Inject, Injectable, Injector } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateLogger, PebElementDef, PebElementType } from '@pe/builder-core';

import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import { PebEditorCartSideBarComponent } from './cart.sidebar';
import { AbstractEditElementWithSidebar } from '../../_sidebar.behavior';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../../../services/editor.behaviors';
import { EDITOR_ENABLED_MAKERS } from '../../../../editor.constants';

const log = pebCreateLogger('editor:behaviors:edit-section');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditCart extends AbstractEditElementWithSidebar<PebEditorCartSideBarComponent> {
  static elementTypes = [PebElementType.Cart];

  static sidebarComponent = PebEditorCartSideBarComponent;

  logger = { log };

  sidebarComponent = PebEditorCartSideBarComponent;

  constructor(
    injector: Injector,
    public editor: PebAbstractEditor,
    public state: PebEditorState,
    public renderer: PebEditorRenderer,
    public store: PebEditorStore,
    @Inject(PEB_EDITOR_EVENTS) protected events: PebEditorEvents,
    @Inject(EDITOR_ENABLED_MAKERS) protected makers: any,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return merge(
      this.singleElementOfTypeSelected$().pipe(
        switchMap((el: PebEditorElement) => {
          this.initProportionDimensionsForm(el);
          this.initBackgroundForm(el);

          const sidebarCmpRef = this.initSidebar(el);

          return merge(
            this.handleProportionDimensionsForm(el),
            this.handleBackgroundForm(el, sidebarCmpRef),
            this.editFlow(el, sidebarCmpRef.instance),
          ).pipe(
            takeUntil(this.state.selectionChanged$()),
            finalize(() => {
              sidebarCmpRef.destroy();
            }),
         );
        }),
      ),
    );
  }

  editFlow(
    element: PebEditorElement,
    sidebar: PebEditorCartSideBarComponent,
  ): Observable<any> {
    return merge(
      sidebar.changeStyle.pipe(
        tap(styles => {
          element.styles = { ...element.styles, ...styles };
          sidebar.styles = element.styles;
        }),
        debounceTime(50),
        switchMap(() => {
          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: element.styles,
          });
        }),
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

          element.definition.data = newElementDef.data;

          return this.store.updateElement(newElementDef);
        }),
      ),
    );
  }
}
