import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { debounceTime, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { cloneDeep, merge as lodashMerge } from 'lodash';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';

import { PebEditorShapeSidebar } from './shape.sidebar';
import { PebEditorElement } from '../../../renderer/editor-element';
import { showImageSpinner } from '../../_utils/sidebar.common';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';

const log = pebCreateLogger('editor:behaviors:edit-block');

const styleDefaults = {
  opacity: 1,
};

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditShape extends AbstractEditElementWithSidebar<PebEditorShapeSidebar> {
  static elementTypes = [ PebElementType.Shape, PebElementType.Block ];

  sidebarComponent = PebEditorShapeSidebar;

  logger = { log };

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp) => {
        this.initPositionForm(elCmp);
        this.initDimensionsForm(elCmp);
        this.initBackgroundForm(elCmp);

        const sidebarRef = this.initSidebar(elCmp);

        return merge(
          this.handlePositionForm(elCmp),
          this.handleDimensionsForm(elCmp),
          this.handleBackgroundForm(elCmp, sidebarRef),
          this.editFlow(elCmp, sidebarRef.instance),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => sidebarRef.destroy()),
        );
      }),
    );
  }

  //
  //  Old code
  //

  editFlow(element: PebEditorElement, sidebar: PebEditorShapeSidebar): Observable<any> {
    const initialState = {
      definition: cloneDeep(element.definition),
      styles: lodashMerge({}, styleDefaults, element.styles),
    };

    return merge(
      sidebar.changeStyle.pipe(
        map(styles => this.updateStyles(element, styles)),
        debounceTime(500),
        switchMap(() => {
          return this.store.updateStyles(this.state.screen, {
            [ element.definition.id ]: element.styles,
          }).pipe(
            tap(() => showImageSpinner(false, element)),
          );
        }),
        tap(() => element.detectChanges()),
      ),
      // TODO: Return this then changeStyleFinal works
      // sidebar.changeStyleFinal.pipe(
      //   filter(() => !!Object.keys(diff(initialState.styles, element.styles)).length),
      //   switchMap(() => {
      //     return this.store.updateStyles(this.state.screen, {
      //       [element.definition.id]: element.styles,
      //     }).pipe(
      //       tap(() => showImageSpinner(false, element)),
      //     );
      //   }),
      // ),
    );
  }
}
