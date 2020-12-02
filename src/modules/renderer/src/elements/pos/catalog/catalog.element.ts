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
  transformStyleProperty,
} from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebPosCatalogProductElement } from './catalog-product/catalog-product.element';
import { PebPosCatalogNavbarElement } from './catalog-navbar/catalog-navbar.element';
import { PebPosCatalogFiltersElement } from './catalog-filters/catalog-filters.element';
import { PebPosCatalogNavbarMobileElement } from './catalog-navbar-mobile/catalog-navbar-mobile.element';

interface PosCatalog extends PebElementDef {
  variant: 'link' | 'purchase';
}

interface PosCatalogFilter {
  name: string;
  active: boolean;
  disabled: boolean;
  children: PosCatalogFilter[];
}

interface ProductElementData {
  title: string;
  image: string;
  shownFilters: boolean;
  filters: PosCatalogFilter[];
  products: any[];
  displayMode?: any;
}

export enum DisplayModes {
  GRID = 'grid',
  TABLE = 'table',
}

export type ProductContext = PebElementContext<ProductElementData>;

const DEFAULT_COLUMNS = {
  [PebScreen.Desktop]: 3,
  [PebScreen.Tablet]: 2,
  [PebScreen.Mobile]: 1,
}

const HEADER_STYLES = {
  height: {
    [PebScreen.Desktop]: 225,
    [PebScreen.Tablet]: 225,
    [PebScreen.Mobile]: 225,
  },
  fontSize: {
    [PebScreen.Desktop]: 40,
    [PebScreen.Tablet]: 40,
    [PebScreen.Mobile]: 40,
  },
};

const NAVBAR_STYLES = {
  height: {
    [PebScreen.Desktop]: 60,
    [PebScreen.Tablet]: 60,
    [PebScreen.Mobile]: 60,
  },
  fontSize: {
    [PebScreen.Desktop]: 12,
    [PebScreen.Tablet]: 12,
    [PebScreen.Mobile]: 12,
  },
};

const FILTERS_STYLES = {
  fontSize: {
    [PebScreen.Desktop]: 14,
    [PebScreen.Tablet]: 14,
    [PebScreen.Mobile]: 14,
  },
};

const PRODUCT_STYLES = {
  height: {
    [PebScreen.Desktop]: 500,
    [PebScreen.Tablet]: 500,
    [PebScreen.Mobile]: 500,
  },
  fontSize: {
    [PebScreen.Desktop]: 17,
    [PebScreen.Tablet]: 16,
    [PebScreen.Mobile]: 14,
  },
};

@Component({
  selector: 'peb-element-pos-catalog',
  templateUrl: './catalog.element.html',
  styleUrls: ['./catalog.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPosCatalogElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() context: ProductContext;

  @ViewChild(PebPosCatalogNavbarElement, { read: ElementRef }) navbarRef: ElementRef;
  @ViewChild(PebPosCatalogNavbarMobileElement, { read: ElementRef }) mobileNavbarRef: ElementRef;
  @ViewChild(PebPosCatalogFiltersElement, { read: ElementRef }) filtersRef: ElementRef;
  @ViewChild('productsGridRef') productsGridRef: ElementRef;
  @ViewChildren(PebPosCatalogProductElement, { read: ElementRef }) productElements: QueryList<ElementRef>;

  PebElementContextState = PebElementContextState;
  defaultFontSize = 12;
  defaultFontFamily = 'Roboto';
  PebScreen = PebScreen;
  DisplayModes = DisplayModes;

  static contextFetcher(ctx) {
    return {
      '@pos-catalog': ctx['@pos-catalog'],
      '@mobile-menu': ctx['@mobile-menu'],
    };
  }

  get catalogContext() {
    return this.context['@pos-catalog'];
  }


  get menuContext() {
    return this.context['@mobile-menu'];
  }

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      navbar: this.navbarRef?.nativeElement,
      mobileNavbar: this.mobileNavbarRef?.nativeElement,
      filters: this.filtersRef?.nativeElement,
      productsGrid: this.productsGridRef?.nativeElement,
      products: this.productElements?.toArray().map(a => a.nativeElement) || [],
    };
  }
  get mappedStyles() {
    const { screen, scale, interactions } = this.options;

    //TODO(Maxim Andruh): Remove custom styles

    const defaultGridColumns = DEFAULT_COLUMNS[PebScreen.Desktop]

    return {
      host: {
        ...('width' in this.styles && { width: transformStyleProperty(this.styles.width, scale) }),
        ...('height' in this.styles && { height: transformStyleProperty(this.styles.height, scale) }),
        ...('left' in this.styles && { left: transformStyleProperty(this.styles.left, scale) }),

        ...('borderStyle' in this.styles && { borderStyle: this.styles.borderStyle }),
        ...('borderColor' in this.styles && { borderColor: this.styles.borderColor }),
        ...('borderWidth' in this.styles && { borderWidth: transformStyleProperty(this.styles.borderWidth, 1) }),

        ...('textAlign' in this.styles && { textAlign: this.styles.textAlign }),
        ...('transform' in this.styles && { transform: this.styles.transform }),

        background: this.styles?.mode === 'dark' ? '#333' : '#fff',
        color: this.styles?.mode === 'dark' ? '#fff' : '#333',
      },
      header: {
        height: `${HEADER_STYLES.height[screen] * scale}px`,

        ...('catalogTitleTextDecoration' in this.styles && { textDecoration: this.styles.catalogTitleTextDecoration }),
        ...('catalogTitleFontWeight' in this.styles && { fontWeight: this.styles.catalogTitleFontWeight }),
        ...('catalogTitleFontStyle' in this.styles && { fontStyle: this.styles.catalogTitleFontStyle }),
        ...('catalogTitleFontFamily' in this.styles && { fontFamily: this.styles.catalogTitleFontFamily }),

        fontSize:
          this.styles.catalogTitleFontSize
            ? transformStyleProperty(this.styles.catalogTitleFontSize, scale)
            : HEADER_STYLES.fontSize[screen] * scale + 'px',
        color: this.styles.catalogTitleColor ?? '#000000',
      },
      navbar: {
        display: this.menuContext?.data?.opened === true
          ? 'none'
          : 'flex',
        background: this.styles?.mode === 'dark' ? '#333' : '#fff',
        height: `${NAVBAR_STYLES.height[screen] * scale}px`,
        fontSize: `${NAVBAR_STYLES.fontSize[screen] * scale}px`,
        ...('borderColor' in this.styles && { borderColor: this.styles.borderColor }),
        ...(interactions && {
          position: 'sticky',
          top: transformStyleProperty(this.styles.top, this.options.scale),
        }),
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
          this.catalogContext?.state === PebElementContextState.Ready &&
          this.catalogContext?.data.shownFilters
            ? 'block'
            : 'none',
        ...('filterTextDecoration' in this.styles && { textDecoration: this.styles.filterTextDecoration }),
        ...('filterFontWeight' in this.styles && { fontWeight: this.styles.filterFontWeight }),
        ...('filterFontStyle' in this.styles && { fontStyle: this.styles.filterFontStyle }),
        ...('filterFontFamily' in this.styles && { fontFamily: this.styles.filterFontFamily }),

        ...('borderStyle' in this.styles && { borderRightStyle: this.styles.borderStyle }),
        ...('borderColor' in this.styles && { borderRightColor: this.styles.borderColor }),
        ...('borderWidth' in this.styles && { borderRightWidth: transformStyleProperty(this.styles.borderWidth, 1) }),

        fontSize: transformStyleProperty(this.styles.filterFontSize ?? this.defaultFontSize, scale),
        color: this.styles.filterColor ?? '#000000',
      },
      productsGrid: {
        gridTemplateColumns: `repeat(${this.styles?.columns ?? defaultGridColumns}, 1fr)`,
      },
      products: {
        height:
          this.displayMode === DisplayModes.GRID
            ? `${PRODUCT_STYLES.height[screen] * scale}px`
            : 'auto',
        fontSize: `${PRODUCT_STYLES.fontSize[screen] * scale}px`,
        textAlign: this.styles.textAlign || 'center',
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
        displayMode: this.catalogContext?.data.displayMode,
      },
    };
  }

  showProductDetails(productId) {
    this.interact(PebInteractionCreator.pos.product.showDetails(productId));
  }

  sort(value: any) {
    this.interact(PebInteractionCreator.pos.catalog.sort(value));
  }

  resetFilters() {
    this.interact(PebInteractionCreator.pos.catalog.resetFilters());
  }

  toggleProductsDisplay() {
    this.interact(PebInteractionCreator.pos.catalog.toggleProductsDisplay());
  }

  searchProducts(value: string) {
    this.interact(PebInteractionCreator.pos.catalog.searchProducts(value));
  }

  onToggleShownFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.pos.catalog.toggleFilters());
  }

  // TODO: add typings
  onToggleFilter(value): void {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.pos.catalog.toggleFilter(value));
  }


  get displayMode(): DisplayModes {
    return this.catalogContext?.data.displayMode ?? DisplayModes.GRID;
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options?.screen;
  }
}
