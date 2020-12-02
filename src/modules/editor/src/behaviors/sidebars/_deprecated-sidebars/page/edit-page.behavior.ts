import { Injectable, Injector, Type } from '@angular/core';
import { merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  map,
  repeat,
  switchMap, take,
  takeUntil,
} from 'rxjs/operators';
import { forEach, isEqual } from 'lodash';

import { getPageUrlByName, pebCreateLogger, PebElementId, PebPageVariant, PebShopRoute } from '@pe/builder-core';
import { PebAbstractElement } from '@pe/builder-renderer';

import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { getShopThemeRoutingPayload, PebEditorStore } from '../../../../services/editor.store';
import { PebEditorPageSidebarComponent } from './page.sidebar';
import { PebChangeShopRouting } from '../../../../services/interfaces';
import { AbstractEditElementWithSidebar } from '../../_sidebar.behavior';

const log = pebCreateLogger('editor:behaviors:edit-page');

@Injectable()
export class PebEditorBehaviorEditPage extends AbstractEditElementWithSidebar<PebEditorPageSidebarComponent> {

  logger = { log };

  sidebarComponent = PebEditorPageSidebarComponent;

  constructor(
    injector: Injector,
    public editor: PebAbstractEditor,
    public store: PebEditorStore,
    public state: PebEditorState,
    public renderer: PebEditorRenderer,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return this.store.activePageId$.pipe(
      switchMap(() => {
        return this.state.selectedElements$.pipe(
          distinctUntilChanged(isEqual),
          filter((selectedIds: PebElementId[]) => {
            const activePage = this.store.snapshot.pages[this.store.activePageId];
            const documentId = this.store.snapshot.templates[activePage.templateId].id;
            return !selectedIds.length || selectedIds.includes(documentId);
          }),
        );
      }),
      switchMap((res) => {
        const snapshot = this.store.snapshot;
        const activePage = snapshot.pages[this.store.activePageId];
        const documentEl: PebEditorElement = this.renderer.registry.get(
          snapshot.templates[activePage.templateId].id,
        );
        if (!documentEl) {
          // This element hasn't rendered yet
          return this.renderer.rendered.pipe(
            map((registry: any) => registry.get(snapshot.templates[activePage.templateId].id)),
            filter((documentElement: PebAbstractElement) => !!documentElement),
            take(1),
            switchMap((documentElement) => this.openPageSidebar(activePage, snapshot, documentElement)),
          )
        } else {
          return this.openPageSidebar(activePage, snapshot, documentEl);
        }
      }),
      repeat(),
    );
  }

  private openPageSidebar(activePage, snapshot, documentEl): Observable<any> {
    const sidebarCmpRef = this.editor.openSidebar(this.sidebarComponent);
    this.initBackgroundForm(documentEl);

    sidebarCmpRef.instance.page = activePage;
    sidebarCmpRef.instance.shop = snapshot.shop;
    sidebarCmpRef.instance.styles = documentEl.styles;
    sidebarCmpRef.changeDetectorRef.detectChanges();
    sidebarCmpRef.instance.component = documentEl;

    return merge(
      this.trackSidebarChanges(activePage, documentEl, sidebarCmpRef.instance),
      this.handleBackgroundForm(documentEl, sidebarCmpRef),
    )
      .pipe(
      takeUntil(
        this.state.selectedElements$.pipe(
          filter(els => els.length > 0 && !els.includes(documentEl?.definition.id)),
        ),
      ),
      finalize(() => {
        sidebarCmpRef.destroy();
      }),
    );
  }

  trackSidebarChanges(
    activePage: any,
    documentEl: PebEditorElement,
    sidebar: PebEditorPageSidebarComponent,
  ): Observable<any> {
    return merge(
      sidebar.changePageName.pipe(
        filter((value: string) => value && activePage.name !== value),
        switchMap((value: string) => this.store.updatePage(activePage, { name: value })),
      ),

      sidebar.changePageType.pipe(
        switchMap(({ value }) => this.store.updatePage(activePage, { variant: value })),
      ),

      sidebar.changeRootPage.pipe(
        switchMap((value: boolean) => {
          const pagesPayload = this.getPagesPayload(value, activePage);
          const routingPayload = this.getRoutingByPages(pagesPayload);
          return this.store.updatePagesWithShopRouting(pagesPayload, routingPayload);
        }),
      ),
      // TODO(@nastya): Refactor sidebar - move common code of background style
      sidebar.changeBgImage.pipe(
        switchMap((value: string) => {
          documentEl.styles.backgroundColor = '';
          documentEl.styles.backgroundImage = value;

          return this.store.updateStyles(this.state.screen, {
            [documentEl.definition.id]: { backgroundImage: value, backgroundColor: '' },
          });
        }),
      ),
    );
  }

  private getPagesPayload(value: boolean, activePage: any): any[] {
    let altFrontPage = null;
    const currentPagePayload = {variant: value ? PebPageVariant.Front : PebPageVariant.Default};
    const altPagePayload = {variant: value ? PebPageVariant.Default : PebPageVariant.Front};
    // Find in collection page to update (set/unset default value)
    forEach(this.store.snapshot.pages, (page) => {
      if (value && page.variant === PebPageVariant.Front) {
        // Find first page with Front page variant
        altFrontPage = page;
        return false;
      } else if (!value && page.id !== this.store.activePageId) {
        // Find first page !== current page
        altFrontPage = page;
        return false;
      }
    });
    return [
      {
        page: activePage,
        payload: currentPagePayload,
      },
      {
        page: altFrontPage,
        payload: altPagePayload,
      },
    ];
  }

  private getRoutingByPages(pages: {page: any; payload: any;}[]): PebShopRoute[] {
    const routes: PebChangeShopRouting[] = [];
    pages.forEach(({ page, payload }) => {
      routes.push({
        currentUrl: getPageUrlByName(page.name, payload.variant),
        pageId: page.id,
      });
    });
    return getShopThemeRoutingPayload(routes, this.store.snapshot.shop.routing);
  }
}
