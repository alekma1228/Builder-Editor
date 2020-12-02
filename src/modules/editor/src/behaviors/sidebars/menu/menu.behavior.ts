import { Injectable, Injector } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { filter, finalize, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FormArray } from '@angular/forms';
import { isEmpty, isEqual, xorWith } from 'lodash';

import {
  pebCreateLogger,
  PebElementType,
  PebInteractionType,
  PebLink,
  PebPageType,
  PebPageVariant,
} from '@pe/builder-core';
import { PebProductCategory, PebProductsApi } from '@pe/builder-api';

import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { PebEditorMenuSidebar } from './menu.sidebar';
import { PebEditorElementMenu } from '../../../renderer/elements/editor-element-menu';

const log = pebCreateLogger('editor:behaviors:edit-menu');

export const isArrayEqual = (x, y) => isEmpty(xorWith(x, y, isEqual));

@Injectable({ providedIn: 'any' })
export class PebEditorMenuBehavior extends AbstractEditElementWithSidebar<PebEditorMenuSidebar> {
  static elementTypes = [PebElementType.Menu];

  sidebarComponent = PebEditorMenuSidebar;

  productCategories$ = this.productsApi.getProductsCategories().pipe(shareReplay(1));

  logger = { log };

  constructor(
    injector: Injector,
    private productsApi: PebProductsApi,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp: PebEditorElementMenu) => this.productCategories$.pipe(
        map(productCategories => ({ elCmp, productCategories })),
      )),
      switchMap(({ elCmp, productCategories }) => {

        this.initPositionForm(elCmp);
        this.initDimensionsForm(elCmp);
        this.initOpacityForm(elCmp);
        this.initMenuRoutesForm(elCmp, productCategories);
        this.initFontForm(elCmp);

        const sidebarRef = this.initSidebar(elCmp);

        return merge(
          this.handlePositionForm(elCmp),
          this.handleDimensionsForm(elCmp),
          this.handleOpacityForm(elCmp),
          this.handleMenuRoutesForm(elCmp),
          this.handleFontForm(elCmp),
          this.store.snapshot$.pipe(
            /** wait for render – element definition not updated yet */
            switchMap(() => this.renderer.rendered.pipe(
              tap(() => {
                this.updateRoutesForm(elCmp);
              }),
            ),
          )),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => {
            if (elCmp.menuRoutes.form.dirty) {
              elCmp.menuRoutes.submit.next();
            }
            sidebarRef.destroy();
          }),
        );
      }),
    );
  }

  /**
   * Set routes form value from latest element definition on snapshot change.
   */
  updateRoutesForm(elementCmp: PebEditorElementMenu): void {
    const { routes } = elementCmp.definition.data;
    const formArray = elementCmp.menuRoutes.form.controls.routes as FormArray;
    formArray.clear();
    routes.forEach(route =>
      formArray.push(this.formBuilder.group({
        title: route?.title,
        value: route.value,
        variant: route.variant,
        newTab: route.newTab,
      })));
  }

  private initMenuRoutesForm(elementCmp: PebEditorElementMenu, productCategories: PebProductCategory[]) {
    const initialValue = {
      menuRoutes: elementCmp.definition.data.routes,
    };
    const snapshot = this.store.snapshot;

    elementCmp.menuRoutes = {
      initialValue,
      options: {
        variants: [
          { value: PebPageVariant.Default, label: 'Page' },
          { value: PebPageVariant.Category, label: 'Category' },
          { value: '', label: 'External' },
        ],
        [PebPageVariant.Default]:
          snapshot.shop.routing.reduce((acc, route) => {
            if (snapshot.pages[route?.pageId]?.type !== PebPageType.Master) {
              acc.push({ label: route.url, value: route.routeId });
            }
            return acc;
          }, []),
        [PebPageVariant.Category]: [
          { label: 'All', value: '' },
          ...productCategories.map(c => ({ label: c.title, value: c.id })),
        ],
      },
      form: this.formBuilder.group({
        routes: new FormArray(
          initialValue.menuRoutes.map(route => this.formBuilder.group({
            title: route?.title,
            value: route.value,
            variant: route.variant,
            newTab: route.newTab,
          })),
        ),
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  private handleMenuRoutesForm(elementCmp: PebEditorElementMenu): Observable<any> {
    const menuRoutes = elementCmp.menuRoutes;

    return merge(
      menuRoutes.form.valueChanges.pipe(
        tap((changes) => {
          elementCmp.update(this.mapRoutesForm(changes.routes));
        }),
      ),
      menuRoutes.submit.pipe(
        filter(() => !menuRoutes.form.invalid),
        filter(() => !isArrayEqual(
          menuRoutes.initialValue.menuRoutes,
          this.mapRoutesForm(menuRoutes.form.value.routes)),
        ),
        switchMap(() => {
          this.logger.log('Menu: Submit ', menuRoutes.form.value);

          elementCmp.routes = this.mapRoutesForm(menuRoutes.form.value.routes);
          menuRoutes.form.markAsPristine();

          return this.store.updateElement(elementCmp.definition);
        }),
      ),
    );
  }

  private mapRoutesForm(routes: PebLink[]) {
    return routes.map(r => ({
      ...r,
      type: r.variant === PebPageVariant.Default
        ? PebInteractionType.NavigateInternal
        : r.variant === PebPageVariant.Category
          ? PebInteractionType.NavigateInternalSpecial
          : PebInteractionType.NavigateExternal,
    }));
  }
}
