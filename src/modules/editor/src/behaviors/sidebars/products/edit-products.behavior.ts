import { ComponentRef, Injectable, Injector } from '@angular/core';
import { merge, Observable } from 'rxjs';
import {
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';

import { PebEditorProductsSidebarComponent } from './products.sidebar';
import { Axis, PebEditorElement } from '../../../renderer/editor-element';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { ProductsDimensionsBehavior } from './products-dimensions.behavior';
import {
  ProductsFontBehavior,
  ProductsFontTypes,
} from './products-font.behavior';
import { getColumnsAndRows } from './products.utils';

const log = pebCreateLogger('editor:behaviors:edit-products');

const DEFAULT_PRODUCT_WIDTH = 220;
const DEFAULT_PRODUCT_HEIGHT = 280;

const PRODUCTS_MARGIN = 15;

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditProducts extends AbstractEditElementWithSidebar<PebEditorProductsSidebarComponent> {
  static elementTypes = [PebElementType.Products];

  sidebarComponent = PebEditorProductsSidebarComponent;

  logger = { log };

  behaviourState: {
    sidebarRef: ComponentRef<PebEditorProductsSidebarComponent>;
    activeElement: PebEditorElement;
  } = {
    sidebarRef: null,
    activeElement: null,
  };

  constructor(
    private productsDimensionsBehavior: ProductsDimensionsBehavior,
    private productsFontBehavior: ProductsFontBehavior,
    injector: Injector,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap(elCmp => {
        const sidebarRef = this.initSidebar(elCmp);
        const sidebar = sidebarRef.instance;
        sidebar.context = elCmp.context;
        this.initShadowForm(elCmp);
        this.initPositionForm(elCmp);
        this.initDimensionsForm(elCmp);
        this.productsDimensionsBehavior.initDimensionsForm(elCmp);

        sidebar.priceFont = this.productsFontBehavior.initProductFontForm(
          elCmp.styles,
          ProductsFontTypes.Price,
        );
        sidebar.titleFont = this.productsFontBehavior.initProductFontForm(
          elCmp.styles,
          ProductsFontTypes.Title,
        );

        return merge(
          this.productsGridFlow(elCmp, sidebar),
          this.handleShadowForm(elCmp),
          this.handleProductsStyleChanges(elCmp, sidebar),
          this.productsFontBehavior.handleProductFontForm(
            elCmp,
            sidebar.priceFont,
          ),
          this.productsFontBehavior.handleProductFontForm(
            elCmp,
            sidebar.titleFont,
          ),
          this.handlePositionForm(elCmp),
          this.handleDimensionsForm(elCmp),
          this.productsDimensionsBehavior.handleDimensionsForm(elCmp),
          this.handleDeleteProducts(elCmp, sidebar),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => sidebarRef.destroy()),
        );
      }),
    );
  }

  private handleDeleteProducts(
    elCmp: PebEditorElement,
    sidebar: PebEditorProductsSidebarComponent,
  ) {
    return sidebar.removeProductHandler.pipe(
      filter(product => !!product),
      map((product: any) =>
        elCmp.context.data
          .filter(({ id }) => id !== product.id)
          .map(({ id }) => id),
      ),
      switchMap(productsIds =>
        this.loadProducts(elCmp, sidebar, productsIds).pipe(
          tap(() => elCmp.dimensions.update()),
        ),
      ),
    );
  }

  private productsGridFlow(
    element: PebEditorElement,
    sidebar: PebEditorProductsSidebarComponent,
  ): Observable<any> {
    return sidebar.openProductsGrid.pipe(
      switchMap(() =>
        this.editor
          .openProductsDialog(
            element.context?.data?.length
              ? element.context.data?.map(p => p.id)
              : [],
          )
          .pipe(map(productsIds => ({ productsIds, elCmp: element }))),
      ),
      filter(({ productsIds }) => !!productsIds),
      switchMap(({ elCmp, productsIds }) =>
        this.loadProducts(elCmp, sidebar, productsIds).pipe(
          tap(() => this.calcGridSize(elCmp)),
        ),
      ),
    );
  }

  private loadProducts(
    elCmp: PebEditorElement,
    sidebar: PebEditorProductsSidebarComponent,
    productsIds: string[],
  ) {
    const columns = Number(elCmp.styles.productTemplateColumns || 1);
    const rows = Number(elCmp.styles.productTemplateRows || 1);

    const nextColumns = productsIds.length
      ? columns > productsIds.length
        ? productsIds.length
        : columns
      : columns;

    const nextRows = productsIds.length
      ? Math.ceil(productsIds.length / nextColumns)
      : rows;

    const nextStyles = {
      ...elCmp.styles,
      productTemplateColumns: nextColumns,
      productTemplateRows: nextRows,
    };

    return this.store.updateElementKit(
      this.state.screen,
      elCmp.definition,
      { [elCmp.definition.id]: nextStyles },
      { service: 'products', method: 'getByIds', params: [productsIds] },
    ).pipe(
      switchMap(() => this.renderer.rendered),
      tap(() => {
        sidebar.context = elCmp.context;
      }),
    );
  }

  private handleProductsStyleChanges(
    elCmp: PebEditorElement,
    sidebar: PebEditorProductsSidebarComponent,
  ): Observable<any> {
    return sidebar.changes.pipe(
      map(changes => ({
        ...elCmp.styles,
        ...changes.styles,
      })),
    );
  }

  protected getDimensionsLimits(elementCmp: PebEditorElement) {
    const widthMaxDimensions = elementCmp.getMaxPossibleDimensions(
      Axis.Horizontal,
    );
    const heightMaxDimensions = elementCmp.getMaxPossibleDimensions(
      Axis.Vertical,
    );

    if (!widthMaxDimensions || !heightMaxDimensions) {
      return;
    }

    const { productTemplateColumns, productTemplateRows } = getColumnsAndRows(
      elementCmp,
    );
    const itemWidth =
      elementCmp.productDimensions?.form.value.width ??
      elementCmp.styles.itemWidth ??
      DEFAULT_PRODUCT_WIDTH;
    const itemHeight =
      elementCmp.productDimensions?.form.value.height ??
      elementCmp.styles.itemHeight ??
      DEFAULT_PRODUCT_HEIGHT;
    const elementWidthMinDimensions =
      itemWidth * productTemplateColumns +
      (PRODUCTS_MARGIN * productTemplateColumns - 1);

    const elementHeightMinDimensions = itemHeight * productTemplateRows;

    return {
      width: {
        min: Math.max(
          elementWidthMinDimensions,
          elementCmp.getMinPossibleDimensions(Axis.Horizontal),
        ),
        max: widthMaxDimensions.size - widthMaxDimensions.spaceStart,
      },
      height: {
        min: Math.max(
          elementHeightMinDimensions,
          elementCmp.getMinPossibleDimensions(Axis.Vertical),
        ),
        max: heightMaxDimensions.size - heightMaxDimensions.spaceStart,
      },
    };
  }

  private calcGridSize(elCmp: PebEditorElement, columns?: number) {
    const { productTemplateColumns, productTemplateRows } = getColumnsAndRows(
      elCmp,
    );
    const nextColumns = columns ?? productTemplateColumns;

    elCmp.productDimensions.update();
    elCmp.dimensions.update();
    elCmp.dimensions.form.patchValue({
      width: Math.max(
        elCmp.getMinPossibleDimensions(Axis.Horizontal),
        elCmp.productDimensions.form.value.width * nextColumns + nextColumns * 15,
      ),
      height: elCmp.productDimensions.form.value.height * productTemplateRows,
    });
  }
}
