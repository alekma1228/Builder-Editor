import { PebPageVariant } from '../models/client';
import { PebLink } from '../models/element';

export enum PebInteractionType {
  NavigateInternal = 'navigate.internal-page',
  NavigateInternalSpecial = 'navigate.internal-special-page',
  NavigateExternal = 'navigate.external-page',

  NavigationToggleMobileMenu = 'navigation.toggle-mobile-menu',
  NavigationHideMobileMenu = 'navigation.hide-mobile-menu',
  NavigationShowDropdown = 'navigation.show-dropdown',

  CartClick = 'cart.click',

  CategoryToggleFilters = 'category.toggle-filters',
  CategoryToggleFilter = 'category.toggle-filter',
  CategorySort = 'category.sort',
  CategoryResetFilters = 'category.reset-filters',
  CategoryToggleProductsDisplay = 'category.change-products-display',
  CategorySearchProducts = 'category.search-products',

  /** @deprecated use NavigateInternal */
  ProductNavigateToPage = 'product.navigate-to-page',
  ProductAddToCart = 'product.add-to-cart',

  CheckoutOpenAmount = 'checkout.open-amount',
  CheckoutOpenQr = 'checkout.open-qr',

  PosCatalogToggleFilters = 'pos-catalog.toggle-filters',
  PosCatalogToggleFilter = 'pos-catalog.toggle-filter',
  PosCatalogSort = 'pos-catalog.sort',
  PosCatalogResetFilters = 'pos-catalog.reset-filters',
  PosCatalogToggleProductsDisplay = 'pos-catalog.change-products-display',
  PosCatalogSearchProducts = 'pos-catalog.search-products',
  PosCatalogShowProductDetails = 'pos-catalog.show-product-details',
}

export interface PebInteraction {
  type: PebInteractionType,
}

export interface PebInteractionWithPayload<P> extends PebInteraction {
  payload: P,
}

function createInteraction(type: PebInteractionType): PebInteraction
function createInteraction<P>(type: PebInteractionType, payload: P): PebInteractionWithPayload<P>
function createInteraction<P>(type: PebInteractionType, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

export const PebInteractionCreator = {
  navigate: {
    internal: (id: string) => createInteraction(PebInteractionType.NavigateInternal, id),
    internalSpecial: (variant: PebPageVariant, value: string) =>
      createInteraction(PebInteractionType.NavigateInternalSpecial, { variant, value }),
    external: <T = PebLink | string>(interaction: T) =>
      createInteraction<T>(PebInteractionType.NavigateExternal, interaction),
  },
  navigation: {
    toggleMobileMenu: () => createInteraction(PebInteractionType.NavigationToggleMobileMenu),
    hideMobileMenu: () => createInteraction(PebInteractionType.NavigationHideMobileMenu),
    showDropdown: () => createInteraction(PebInteractionType.NavigationShowDropdown),
  },
  cart: {
    click: () => createInteraction(PebInteractionType.CartClick),
  },
  category: {
    toggleFilters: () => createInteraction(PebInteractionType.CategoryToggleFilters),
    // TODO: add typings
    toggleFilter: (filter: any) => createInteraction(PebInteractionType.CategoryToggleFilter, filter),
    // TODO: add typings
    sort: (value: any) => createInteraction(PebInteractionType.CategorySort, value),
    resetFilters: () => createInteraction(PebInteractionType.CategoryResetFilters),
    toggleProductsDisplay: () => createInteraction(PebInteractionType.CategoryToggleProductsDisplay),
    searchProducts: (value: string) => createInteraction(PebInteractionType.CategorySearchProducts, value),
  },
  product: {
    /** @deprecated use navigate.internal */
    navigateToPage: (id: string) => createInteraction(PebInteractionType.ProductNavigateToPage, id),
    // TODO: add typings
    addToCart: (product: any) => createInteraction(PebInteractionType.ProductAddToCart, product),
  },
  checkout: {
    openAmount: () => createInteraction(PebInteractionType.CheckoutOpenAmount),
    openQr: () => createInteraction(PebInteractionType.CheckoutOpenQr),
  },
  pos: {
    catalog: {
      toggleFilters: () => createInteraction(PebInteractionType.PosCatalogToggleFilters),
      // TODO: add typings
      toggleFilter: (filter: any) => createInteraction(PebInteractionType.PosCatalogToggleFilter, filter),
      // TODO: add typings
      sort: (value: any) => createInteraction(PebInteractionType.PosCatalogSort, value),
      resetFilters: () => createInteraction(PebInteractionType.PosCatalogResetFilters),
      toggleProductsDisplay: () => createInteraction(PebInteractionType.PosCatalogToggleProductsDisplay),
      searchProducts: (value: string) => createInteraction(PebInteractionType.PosCatalogSearchProducts, value),
    },
    product: {
      showDetails: (id: string) => createInteraction(PebInteractionType.PosCatalogShowProductDetails, id),
    },
  },
}
