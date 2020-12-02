import { Injectable } from '@angular/core';
import { isBoolean } from 'lodash';
import { merge, Observable } from 'rxjs';
import {
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import { PebEditorBehaviourAbstract } from '../../../../editor.constants';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { EditorSidebarTypes, PebEditorState } from '../../../../services/editor.state';
import { PebEditorStore } from '../../../../services/editor.store';
import { PebEditorToolbarComponent } from '../../../../toolbar/toolbar.component';
import { PebEditorSeoSidebar } from './seo.sidebar';
import { PebChangeShopRouting } from '../../../../services/interfaces';

@Injectable()
export class PebEditorBehaviorEditSeo implements PebEditorBehaviourAbstract {
  sidebarOpened = false;

  toolbar: PebEditorToolbarComponent = (this.editor.toolbar as PebEditorToolbarComponent);

  constructor(
    private editor: PebAbstractEditor,
    private store: PebEditorStore,
    private state: PebEditorState,
  ) {}

  init(): Observable<any> {
    return this.toolbar.toggleSeoSidebar.pipe(
      map(toggle => isBoolean(toggle) ? !toggle : this.sidebarOpened),
      filter(toggle => !toggle),
      switchMap(() => {
        this.sidebarOpened = true;

        this.state.hoveredElement = null;
        this.state.selectedElements = [];
        const snapshot = this.store.snapshot;

        this.toolbar.seoButton.nativeElement.classList.add('tool--active');
        const activePage = snapshot.pages[this.store.activePageId];

        const sidebarCmpRef = this.editor.openSidebar(PebEditorSeoSidebar);
        sidebarCmpRef.instance.page = activePage;
        const pageRoute = snapshot.shop.routing.find(route => route.pageId === activePage.id);
        sidebarCmpRef.instance.url = pageRoute ? pageRoute.url : '';

        this.state.sidebarsActivity[EditorSidebarTypes.Inspector] = true;

        return this.trackSidebarChanges(activePage, sidebarCmpRef.instance).pipe(
          takeUntil(
            merge(
              this.state.selectedElements$.pipe(
                filter(els => els.length > 0),
              ),
              this.toolbar.toggleSeoSidebar.asObservable(),
            ),
          ),
          finalize(() => {
            if (!this.state.selectedElements.length) {
              this.state.sidebarsActivity[EditorSidebarTypes.Inspector] = false;
            }
            sidebarCmpRef.destroy();
            this.toolbar.seoButton.nativeElement.classList.remove('tool--active');

            this.sidebarOpened = false;
          }),
        );
      }),
    );
  }

  trackSidebarChanges(activePage: any, sidebar: PebEditorSeoSidebar): Observable<any> {

    return merge(
      sidebar.changeTitle.pipe(
        switchMap((value: any) => {
          return this.store.updatePage(activePage, value);
        })),
      sidebar.changeUrl.pipe(
        switchMap((url: string) => {
          const routing: PebChangeShopRouting[] = [{
            currentUrl: url,
            pageId: activePage.id,
          }];
          return this.store.updateShopThemeRouting(routing);
        })),
      sidebar.changeDescription.pipe(
        switchMap((description: string) => {
          return this.store.updatePage(activePage, { data: { description }});
        })),
      sidebar.changeShowInSearchResults.pipe(
        switchMap((showInSearchResults: boolean) => {
          return this.store.updatePage(activePage, { data: { showInSearchResults }});
        })),
      sidebar.changeCanonicalUrl.pipe(
        switchMap((canonicalUrl: string) => {
          return this.store.updatePage(activePage, { data: { canonicalUrl }});
        })),
      sidebar.changeMarkupData.pipe(
        switchMap((markupData: string) => {
          return this.store.updatePage(activePage, { data: { markupData }});
        })),
      sidebar.changeCustomMetaTags.pipe(
        switchMap((customMetaTags: string) => {
          return this.store.updatePage(activePage, { data: { customMetaTags }});
        })),
    );
  }
}
