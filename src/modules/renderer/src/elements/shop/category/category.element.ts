import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  PebElementDef,
  PebElementStyles,
  PebInteractionCreator,
  PebScreen,
} from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebShopCategoryProductElement } from './category-product/category-product.element';
import { PebShopCategoryHeaderElement } from './category-header/category-header.element';
import { PebShopCategoryNavbarElement } from './category-navbar/category-navbar.element';
import { PebShopCategoryFiltersElement } from './category-filters/category-filters.element';
import { PebShopCategoryNavbarMobileElement } from './category-navbar-mobile/category-navbar-mobile.element';

interface ShopCategory extends PebElementDef {
  variant: 'link' | 'purchase';
}

interface ShopCategoryFilter {
  name: string;
  active: boolean;
  disabled: boolean;
  children: ShopCategoryFilter[];
}

interface ProductElementData {
  title: string;
  image: string;
  shownFilters: boolean;
  filters: ShopCategoryFilter[];
  products: any[];
  displayMode?: any;
}

export enum DisplayModes {
  GRID = 'grid',
  TABLE = 'table',
}

export type ProductContext = PebElementContext<ProductElementData>;

const HEADER_STYLES = {
  height: {
    desktop: 225,
    tablet: 225,
    mobile: 225,
  },
  fontSize: {
    desktop: 40,
    tablet: 40,
    mobile: 40,
  },
};

const NAVBAR_STYLES = {
  height: {
    desktop: 60,
    tablet: 60,
    mobile: 60,
  },
  fontSize: {
    desktop: 12,
    tablet: 12,
    mobile: 12,
  },
};

const FILTERS_STYLES = {
  fontSize: {
    desktop: 14,
    tablet: 14,
    mobile: 14,
  },
};

const PRODUCT_STYLES = {
  height: {
    desktop: 500,
    tablet: 500,
    mobile: 500,
  },
  fontSize: {
    desktop: 17,
    tablet: 16,
    mobile: 14,
  },
};

@Component({
  selector: 'peb-element-shop-category',
  templateUrl: './category.element.html',
  styleUrls: ['./category.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopCategoryElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() context: ProductContext;

  @ViewChild(PebShopCategoryHeaderElement, { read: ElementRef }) headerRef: ElementRef;
  @ViewChild(PebShopCategoryNavbarElement, { read: ElementRef }) navbarRef: ElementRef;
  @ViewChild(PebShopCategoryNavbarMobileElement, { read: ElementRef }) mobileNavbarRef: ElementRef;
  @ViewChild(PebShopCategoryFiltersElement, { read: ElementRef }) filtersRef: ElementRef;
  @ViewChild('productsGridRef') productsGridRef: ElementRef;
  @ViewChildren(PebShopCategoryProductElement, { read: ElementRef }) productElements: QueryList<ElementRef>;

  PebElementContextState = PebElementContextState;
  defaultFontSize = 12;
  defaultFontFamily = 'Roboto';
  PebScreen = PebScreen;
  DisplayModes = DisplayModes;

  static contextFetcher(ctx, id: string) {
    return {
      '@category': ctx['@category'],
      '@mobile-menu': ctx['@mobile-menu'],
      'categories': ctx[id],
    };
  }

  get categoryContext() {
    return this.context?.['@category'];
  }

  get menuContext() {
    return this.context?.['@mobile-menu'];
  }

  get categoriesContext() {
    return this.context?.['categories'];
  }

  onToggleShownFilters(): void {
    console.log('onToggleShownFilters');

    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.category.toggleFilters());
  }

  // TODO: add typings
  onToggleFilter(value): void {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.category.toggleFilter(value));
  }

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      header: this.headerRef?.nativeElement,
      navbar: this.navbarRef?.nativeElement,
      mobileNavbar: this.mobileNavbarRef?.nativeElement,
      filters: this.filtersRef?.nativeElement,
      productsGrid: this.productsGridRef?.nativeElement,
      products: this.productElements?.toArray().map(a => a.nativeElement) || [],
    };
  }

  get potentialContainer() {
    return this.nativeElement;
  }

  get mappedStyles() {
    const { screen, scale } = this.options;
    const { styles } = this;

    //TODO(Maxim Andruh): Remove custom styles

    const defaultGridColumns = screen === PebScreen.Desktop
      ? 3
      : screen === PebScreen.Tablet
        ? 2
        : 1;

    return {
      host: {
        position: 'relative',
        display: styles.display ?? 'block',
        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        width: styles.width ? `${+styles.width * scale}px` : `100%`,
        height: styles.height ? `${+styles.height * scale}px` : null,
        left: styles.left ? `${+styles.left * scale}px` : null,
        background: styles?.mode === 'dark' ? '#333' : '#fff',
        color: styles?.mode === 'dark' ? '#fff' : '#333',
        transform: styles.transform,
        borderStyle: styles.borderStyle ? styles.borderStyle : null,
        borderColor: styles.borderColor ? styles.borderColor : null,
        borderWidth: styles.borderWidth
          ? (styles.borderWidth as number) * scale + 'px'
          : '0px',
      },
      header: {
        height: `${HEADER_STYLES.height[screen] * scale}px`,
        textDecoration: styles.categoryTitleTextDecoration || null,
        fontWeight: styles.categoryTitleFontWeight || 'normal',
        fontStyle: styles.categoryTitleFontStyle || null,
        fontFamily: styles.categoryTitleFontFamily || this.defaultFontFamily,
        fontSize:
          (+styles.categoryTitleFontSize || HEADER_STYLES.fontSize[screen]) * scale + 'px',
        color: styles.categoryTitleColor || '#000000',
      },
      navbar: {
        display: this.menuContext?.data?.opened === true
          ? 'none'
          : 'flex',
        background: styles?.mode === 'dark' ? '#333' : '#fff',
        borderColor: styles?.borderColor,
        height: `${NAVBAR_STYLES.height[screen] * scale}px`,
        fontSize: `${NAVBAR_STYLES.fontSize[screen] * scale}px`,
      },
      mobileNavbar: {
        display: this.menuContext?.data?.opened === true
          ? 'none'
          : 'flex',
        justifyContent: 'space-between',
        padding: '0 1em',
      },
      filters: {
        display:
          this.categoryContext?.state === PebElementContextState.Ready &&
          this.categoryContext?.data.shownFilters
            ? 'block'
            : 'none',
        textDecoration: styles.filterTextDecoration || null,
        fontWeight: styles.filterFontWeight || 'normal',
        fontStyle: styles.filterFontStyle || null,
        fontFamily: styles.filterFontFamily || this.defaultFontFamily,
        fontSize:
          (+styles.filterFontSize || this.defaultFontSize) * scale + 'px',
        color: styles.filterColor || '#000000',
      },
      productsGrid: {
        gridTemplateColumns: `repeat(${styles?.columns ?? defaultGridColumns}, 1fr)`,
        boxShadow: `inset 1px 0 0 0 ${styles?.borderColor ?? '#d6d6d6'}`,
      },
      products: {
        height:
          this.displayMode === DisplayModes.GRID
            ? `${PRODUCT_STYLES.height[screen] * scale}px`
            : 'auto',
        fontSize: `${PRODUCT_STYLES.fontSize[screen] * scale}px`,
      },
    };
  }

  // Adding to product context - displayMode property
  getFullProductContext(
    productContext: PebElementContext<any>,
  ): PebElementContext<any> {
    return {
      ...productContext,
      data: {
        ...productContext.data,
        displayMode: this.categoryContext?.data.displayMode,
      },
    };
  }

  navigateToProductPage(productId) {
    this.interact(PebInteractionCreator.product.navigateToPage(productId));
  }

  toggleFilters(value: any) {
    this.interact(PebInteractionCreator.category.toggleFilter(value));
  }

  sort(value: any) {
    this.interact(PebInteractionCreator.category.sort(value));
  }

  resetFilters() {
    this.interact(PebInteractionCreator.category.resetFilters());
  }

  toggleProductsDisplay() {
    this.interact(PebInteractionCreator.category.toggleProductsDisplay());
  }

  searchProducts(value: string) {
    this.interact(PebInteractionCreator.category.searchProducts(value));
  }

  get displayMode(): DisplayModes {
    return this.categoryContext?.data.displayMode ?? DisplayModes.GRID;
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options?.screen;
  }
}
