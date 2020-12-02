import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebLogoElement } from './elements/company/logo/logo.element';
import { PebMenuElement } from './elements/company/menu/menu.element';
import { PebBlockElement } from './elements/general/block/block.element';
import { PebButtonElement } from './elements/general/button/button.element';
import { PebCarouselElement } from './elements/general/carousel/carousel.element';
import { PebDocumentElement } from './elements/general/document/document.element';
import { PebHtmlElement } from './elements/general/html/html.element';
import { PebImageElement } from './elements/general/image/image.element';
import { PebLineElement } from './elements/general/line/line.element';
import { PebScriptElement } from './elements/general/script/script.element';
import { PebSectionElement } from './elements/general/section/section.element';
import { PebShapeElement } from './elements/general/shape/shape.element';
import { PebVideoElement } from './elements/general/video/video.element';
import { PebFiltersIcon } from './elements/icons/filters.icon';
import { PebImageIcon } from './elements/icons/image.icon';
import { PebLeftArrowIcon } from './elements/icons/left-arrow.icon';
import { PebRightArrowIcon } from './elements/icons/right-arrow.icon';
import { PebPlusIcon } from './elements/icons/plus.icon';
import { PebProductIcon } from './elements/icons/product.icon';
import { PebVideoIcon } from './elements/icons/video.icon';
import { PebShopCartElement } from './elements/shop/cart/cart.element';
import { PebShopCategoryFiltersElement } from './elements/shop/category/category-filters/category-filters.element';
import { PebShopCategoryHeaderElement } from './elements/shop/category/category-header/category-header.element';
import { PebShopCategoryNavbarElement } from './elements/shop/category/category-navbar/category-navbar.element';
import { PebShopCategoryProductElement } from './elements/shop/category/category-product/category-product.element';
import { PebShopCategoryElement } from './elements/shop/category/category.element';
import { PebShopProductDetailsCarouselElement } from './elements/shop/product-details/product-details-carousel/product-details-carousel.element';
import { PebShopProductDetailsMobileCarouselElement } from './elements/shop/product-details/product-details-mobile-carousel/product-details-mobile-carousel.element';
import { PebShopProductDetailsElement } from './elements/shop/product-details/product-details.element';
import { PebShopProductElement } from './elements/shop/products/product/product.element';
import { PebShopProductsElement } from './elements/shop/products/products.element';
import { ELEMENT_COMPONENTS } from './renderer.tokens';
import { PebRenderer } from './root/renderer.component';
import { PebRendererChildrenSlotDirective } from './selectors/children-slot.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { PebLoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { PebMobileMenuElement } from './elements/company/mobile-menu/mobile-menu.element';
import { PebShopCategoryNavbarMobileElement } from './elements/shop/category/category-navbar-mobile/category-navbar-mobile.element';
import { PebGridIcon } from './elements/icons/grid.icon';
import { PebMobileFilterIcon } from './elements/icons/mobile-filter.icon';
import { PebSortByIcon } from './elements/icons/sort-by.icon';
import { PebMagnifierIcon } from './elements/icons/magnifier.icon';
import { PebDefaultProductIcon } from './elements/icons/default-product.icon';
import { PebNoLogoIcon } from './elements/icons/no-logo.icon';
import { PebTextElement } from './elements/text/text.element';
import { PebPosCatalogFiltersElement } from './elements/pos/catalog/catalog-filters/catalog-filters.element';
import { PebPosCatalogNavbarElement } from './elements/pos/catalog/catalog-navbar/catalog-navbar.element';
import { PebPosCatalogProductElement } from './elements/pos/catalog/catalog-product/catalog-product.element';
import { PebPosCatalogElement } from './elements/pos/catalog/catalog.element';
import { PebPosCatalogNavbarMobileElement } from './elements/pos/catalog/catalog-navbar-mobile/catalog-navbar-mobile.element';
import { CurrencySignPipe } from './pipes/currency-sign.pipe';
import { CurrencyFormatterPipe } from './pipes/currency-formatter.pipe';

const AVAILABLE_ELEMENTS_SET = [
  // General
  PebDocumentElement,
  PebSectionElement,
  PebBlockElement,
  PebTextElement,
  PebButtonElement,
  PebHtmlElement,
  PebScriptElement,
  PebImageElement,
  PebVideoElement,
  PebShapeElement,
  PebLineElement,
  PebCarouselElement,

  // Business
  PebLogoElement,
  PebMenuElement,
  PebMobileMenuElement,

  // Shop
  PebShopCartElement,
  PebShopCategoryElement,
  PebShopCategoryHeaderElement,
  PebShopCategoryNavbarElement,
  PebShopCategoryFiltersElement,
  PebShopCategoryProductElement,
  PebShopProductElement,
  PebShopProductsElement,
  PebShopProductDetailsElement,
  PebShopProductDetailsCarouselElement,
  PebShopProductDetailsMobileCarouselElement,
  PebShopCategoryNavbarMobileElement,

  // POS
  PebPosCatalogElement,
  PebPosCatalogNavbarElement,
  PebPosCatalogFiltersElement,
  PebPosCatalogProductElement,
  PebPosCatalogNavbarMobileElement,
];

const ICONS = [
  PebProductIcon,
  PebPlusIcon,
  PebFiltersIcon,
  PebLeftArrowIcon,
  PebRightArrowIcon,
  PebImageIcon,
  PebVideoIcon,
  PebGridIcon,
  PebMobileFilterIcon,
  PebSortByIcon,
  PebMagnifierIcon,
  PebDefaultProductIcon,
  PebNoLogoIcon,
];

const PIPES = [
  SafeHtmlPipe,
  SafeUrlPipe,
  CurrencySignPipe,
  CurrencyFormatterPipe,
]

export const AVAILABLE_ELEMENTS_MAP = {
  document: PebDocumentElement,
  section: PebSectionElement,
  block: PebBlockElement,
  text: PebTextElement,
  line: PebLineElement,
  shape: PebShapeElement,
  button: PebButtonElement,
  html: PebHtmlElement,
  script: PebScriptElement,
  image: PebImageElement,
  menu: PebMenuElement,
  video: PebVideoElement,
  carousel: PebCarouselElement,
  'shop-products': PebShopProductsElement,
  'shop-product-details': PebShopProductDetailsElement,
  'shop-cart': PebShopCartElement,
  logo: PebLogoElement,
  'shop-category': PebShopCategoryElement,
  'mobile-menu': PebMobileMenuElement,
  'pos-catalog': PebPosCatalogElement,
  // TODO: add remaining elements
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    PebRenderer,
    PebRendererChildrenSlotDirective,
    PebLoadingSpinnerComponent,
    ...PIPES,
    ...ICONS,
    ...AVAILABLE_ELEMENTS_SET,
  ],
  providers: [
    {
      provide: ELEMENT_COMPONENTS,
      useValue: AVAILABLE_ELEMENTS_MAP,
    },
    {
      provide: 'RENDERER_SETTINGS',
      useValue: {
        dimensions: {
          desktop: 1280,
          tablet: 768,
          mobile: 360,
        },
      },
    },
  ],
  exports: [
    PebRenderer,
    ...PIPES,
  ],
})
export class PebRendererModule {}
