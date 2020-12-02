import { Injectable, Injector } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';

import { PebEditorProductCategorySidebarComponent } from './product-category.sidebar';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { CategoryFontBehavior, CategoryFontTypes } from './products-category-font.behavior';
import { TextAlignmentConstants } from '../_deprecated-sidebars/shared/text/text-style.constants';
import { PebEditorElement } from '../../../renderer/editor-element';
import { PebProductsApi } from '@pe/builder-api';

const log = pebCreateLogger('editor:behaviors:edit-category');

export enum ImageCornersConstants {
  RIGHT = 'right',
  ROUNDED = 'rounded',
}

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditProductCategory
  extends AbstractEditElementWithSidebar<PebEditorProductCategorySidebarComponent>
{
  static elementTypes = [PebElementType.ProductCatalog];

  sidebarComponent = PebEditorProductCategorySidebarComponent;

  logger = { log };

  constructor(
    private categoryFontBehavior: CategoryFontBehavior,
    private productApi: PebProductsApi,
    injector: Injector,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp: PebEditorElement) => {
        const sidebarRef = this.initSidebar(elCmp);
        const sidebar = sidebarRef.instance;

        sidebar.productTitleFont = this.categoryFontBehavior.initCategoryFontForm(
          elCmp.styles,
          CategoryFontTypes.ProductTitle,
        );

        sidebar.productPriceFont = this.categoryFontBehavior.initCategoryFontForm(
          elCmp.styles,
          CategoryFontTypes.ProductPrice,
        );

        sidebar.categoryTitleFont = this.categoryFontBehavior.initCategoryFontForm(
          elCmp.styles,
          CategoryFontTypes.CategoryTitle,
        );

        sidebar.categoryFilterFont = this.categoryFontBehavior.initCategoryFontForm(
          elCmp.styles,
          CategoryFontTypes.CategoryFilter,
        );
        this.initBorderForm(elCmp);
        this.initStyleFrom(sidebar);
        this.initProductSettingsForm(sidebar);
        this.initCategoriesForm(elCmp);

        return merge(
          this.categoryFontBehavior.handleCategoryFontForm(elCmp, sidebar.productTitleFont),
          this.categoryFontBehavior.handleCategoryFontForm(elCmp, sidebar.productPriceFont),
          this.categoryFontBehavior.handleCategoryFontForm(elCmp, sidebar.categoryTitleFont),
          this.categoryFontBehavior.handleCategoryFontForm(elCmp, sidebar.categoryFilterFont),
          this.handleBorderForm(elCmp),
          this.handleStyleCategoryFormChanges(elCmp, sidebar),
          this.handleCategoriesForm(elCmp),
          ...this.handleProductSettingsChanges(elCmp, sidebar),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => {
            sidebarRef.destroy();
          }),
        );
      }),
    );
  }

  private handleStyleCategoryFormChanges(
    elCmp: PebEditorElement,
    sidebar: PebEditorProductCategorySidebarComponent,
  ): Observable<any> {
    const form = sidebar.styleForm;
    return merge(
      form.get('columns').valueChanges.pipe(
        filter(() => !form.get('columns').invalid),
        map(columns => ({ columns })),
      ),
      form
        .get('textAlign')
        .valueChanges.pipe(map(textAlign => ({ textAlign }))),
      form.get('imageCorners').valueChanges.pipe(
        map(imageCorners => ({
          imageCorners,
          borderRadius:
            imageCorners === ImageCornersConstants.RIGHT ? '' : '50%',
        })),
      ),
    ).pipe(
      tap(style => {
        elCmp.styles = { ...elCmp.styles, ...style };
        sidebar.styles = elCmp.styles;
      }),
      switchMap(() => {
        return this.store.updateStyles(this.state.screen, {
          [elCmp.definition.id]: elCmp.styles,
        });
      }),
    );
  }

  private handleProductSettingsChanges(
    elCmp: PebEditorElement,
    sidebar: PebEditorProductCategorySidebarComponent,
  ): Observable<any>[] {
    const form = sidebar.productSettingsForm;
    return [
      form.get('selectAll').valueChanges.pipe(
        tap(value =>
          form.patchValue({
            showDescription: value,
            showPrice: value,
            showVendor: value,
            showProductName: value,
          }),
        ),
      ),
      merge(
        form
          .get('showPrice')
          .valueChanges.pipe(map(showPrice => ({ hideProductPrice: !showPrice }))),
        form
          .get('showProductName')
          .valueChanges.pipe(map(showProductName => ({ hideProductName: !showProductName }))),
      ).pipe(
        switchMap(data => {
          elCmp.target.element = {
            ...elCmp.definition,
            data: {
              ...(elCmp.definition.data || {}),
              ...data,
            },
          };
          sidebar.element = elCmp.definition;
          elCmp.target.applyStyles();
          this.updateProductSettingsSelectAll(sidebar);

          return this.store.updateElement(elCmp.definition);
        }),
      ),
    ];
  }

  private initStyleFrom(sidebar: PebEditorProductCategorySidebarComponent) {
    sidebar.styleForm.patchValue({
      columns:
        sidebar.styles.columns === undefined
          ? sidebar.defaultColumns
          : sidebar.styles.columns,
      textAlign:
        sidebar.styles.textAlign === undefined
          ? TextAlignmentConstants.CENTER
          : sidebar.styles.textAlign,
      imageCorners: sidebar.styles.imageCorners || ImageCornersConstants.RIGHT,
    });
  }

  private initProductSettingsForm(
    sidebar: PebEditorProductCategorySidebarComponent,
  ) {
    const data = sidebar.element?.data;

    if (!data) {
      return;
    }

    const { hideProductPrice, hideProductName } = data;

    sidebar.productSettingsForm.patchValue(
      {
        selectAll: !hideProductPrice && !hideProductName,
        showPrice: !hideProductPrice,
        showProductName: !hideProductName,
      },
      {
        emitEvent: false,
      },
    );
  }

  updateProductSettingsSelectAll(sidebar: PebEditorProductCategorySidebarComponent) {
    const showPrice = sidebar.productSettingsForm.get('showPrice');
    const showProductName = sidebar.productSettingsForm.get('showProductName');
    const selectAll = sidebar.productSettingsForm.get('selectAll');
    showPrice.value === showProductName.value
      ? selectAll.patchValue(showProductName.value, {
          emitEvent: false,
        })
      : selectAll.patchValue(false, { emitEvent: false });
    sidebar.cdr.detectChanges();
  }
}
