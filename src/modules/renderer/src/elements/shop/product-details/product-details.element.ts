import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

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
import { PebRendererOptions } from '../../../renderer.types';

interface ProductElement extends PebElementDef {
  variant: 'link' | 'purchase';
}
interface ProductData {
  title: string;
  description: string;
  price: string;
  salePrice: string;
  currency: string;
  images: string[];
  variants: {
    id: string;
    title: string;
    description: string;
    price: string;
    salePrice: string;
    disabled?: boolean;
    options: { name: string; value: string; disabled?: boolean; }[];
    images: string[];
  }[];
}
type ProductDetailsContext = PebElementContext<ProductData>;

// TODO: Add empty state layout
@Component({
  selector: 'peb-element-shop-product-details',
  templateUrl: './product-details.element.html',
  styleUrls: ['./product-details.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopProductDetailsElement extends PebAbstractElement {
  @Input() element: ProductElement;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  carouselElement: ProductElement = {
    ...this.element,
  };

  @Input() set context(context: ProductDetailsContext) {
    const product = context?.data;
    if (!product) {
      this.contextSubject.next(context);
      return;
    }

    const preparedProduct: ProductData = {
      ...product,
      variants: product.variants
        ? [
            ...product.variants.map(v => ({
              ...v,
              options: v.options.map(o => ({
                ...o,
                name: o.name.trim(),
                value: o.value.trim(),
              })),
            })),
          ]
        : [],
    };

    this.contextSubject.next({
      ...context,
      data: preparedProduct,
    });
  }

  get context(): ProductDetailsContext {
    return this.contextSubject.value;
  }

  contextSubject = new BehaviorSubject<ProductDetailsContext>(null);

  ElementContextState = PebElementContextState;
  PebScreen = PebScreen;
  selectedOptions = {};

  selectedVariantIndexSubject = new BehaviorSubject<number>(0);

  defaultFontSize = 12;
  defaultFontFamily = 'Roboto';

  activeProduct$: Observable<any> = combineLatest([
    this.contextSubject,
    this.selectedVariantIndexSubject,
  ]).pipe(
    filter(([context]) => !!context && !!context.data),
    map(
      ([product, selectedVariantIndex]) =>
        (product.data.variants || [])[selectedVariantIndex] || product,
    ),
    shareReplay(1),
  );

  @ViewChild('titleRef') titleRef: ElementRef;
  @ViewChild('wrapper') wrapperRef: ElementRef;
  @ViewChild('button') buttonRef: ElementRef;
  @ViewChild('carousel') carouselRef: ElementRef;

  static contextFetcher(ctx) {
    return ctx['@product-details'];
  }

  selectedVariantChanged(index: number): void {
    this.selectedVariantIndexSubject.next(index);
    // this.activeSlideIndexSubj$.next(0);
  }

  getAvailableOptions(option: any): any[] {
    const product = this.contextSubject.value.data;
    if (!product || !product.variants || !product.variants.length) {
      return [];
    }

    const options = product.variants.reduce((acc, v) => {
      const filteredOption = v.options.find(o => {
        const duplicated = acc.find(item => item.value === o.value);
        const sameOption = o.name === option.name;

        return sameOption && !duplicated;
      });

      if (!filteredOption) {
        return acc;
      }

      const disabled = product.variants.find(variant =>
        variant.options.every(a =>
          filteredOption.name === a.name
            ? filteredOption.value === a.value
            : !this.selectedOptions[a.name] ||
              this.selectedOptions[a.name] === a.value,
        ),
      );

      filteredOption.disabled = !disabled;

      return [...acc, filteredOption];
    }, []);

    const value = this.selectedOptions[options[0].name];
    const singleOption = !value && options.length === 1;

    if (value === undefined || singleOption) {
      this.selectedOptions[options[0].name] = options[0].value;
      this.cdr.detectChanges();
    }

    return options;
  }

  onChangeOption(value: string, option: any) {
    const availableOptions = this.getAvailableOptions(option);
    const selectedOption = availableOptions.find(o => o.value === value);

    if (selectedOption && selectedOption.disabled) {
      Object.keys(this.selectedOptions)
        .filter(k => k !== selectedOption.name)
        .forEach(key => (this.selectedOptions[key] = null));

      return;
    }

    const product = this.context.data;
    const selectedVariant = product.variants.findIndex(v =>
      v.options.every(
        o =>
          !this.selectedOptions[o.name] ||
          this.selectedOptions[o.name] === o.value,
      ),
    );

    this.selectedVariantIndexSubject.next(selectedVariant);
  }

  allOptionsSelected(options) {
    if (!options || !options.length) {
      return true;
    }

    return options.every(o => this.selectedOptions[o.name]);
  }

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      title: this.titleRef?.nativeElement,
      wrapper: this.wrapperRef?.nativeElement,
      button: this.buttonRef?.nativeElement,
      carousel: this.carouselRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;
    const { styles } = this;

    return {
      host: {
        position: 'relative',

        display: styles.display ?? 'flex',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        height: styles.height ? +styles.height * scale + 'px' : '100%',
        width: styles.width ? +styles.width * scale + 'px' : '100%',
        left: styles.left
          ? (styles.left as number) * scale + 'px'
          : null,
        top: styles.top
          ? (styles.top as number) * scale + 'px'
          : null,
        fontSize:
          (+styles.fontSize || this.defaultFontSize) * scale + 'px',

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
      },
      title: {
        textDecoration: styles.textDecoration || null,
        fontWeight: styles.fontWeight || null,
        fontStyle: styles.fontStyle || null,
        fontFamily: styles.fontFamily || '',
      },
      wrapper: {
        transform: styles.transform || null,
        backgroundColor: styles.backgroundColor,
        height: styles.height ? +styles.height * scale + 'px' : null,
        width: styles.width
          ? this.options.screen === PebScreen.Mobile
            ? 'calc(100% - 2em)'
            : +styles.width * scale + 'px'
          : '100%',
        color: styles.color || 'rgba(17,17,17,.85)',
        textDecoration: styles.textDecoration || null,
        fontWeight: styles.fontWeight || 'normal',
        fontStyle: styles.fontStyle || null,
        fontFamily: styles.fontFamily || this.defaultFontFamily,
      },
      button: {
        backgroundColor: styles.buttonBackgroundColor || '#000',
        color: styles.buttonColor || 'white',
        textDecoration: styles.buttonTextDecoration || null,
        fontWeight: styles.buttonFontWeight || null,
        fontStyle: styles.buttonFontStyle || null,
        fontFamily: styles.buttonFontFamily || this.defaultFontFamily,
        fontSize: styles.buttonFontSize
          ? +styles.buttonFontSize * scale + 'px'
          : null,
      },
      carousel: {
        height: styles.height ? +styles.height * scale + 'px' : null,
        width: styles.width ? +styles.width * scale + 'px' : null,
      },
    };
  }

  get isMobile(): boolean {
    return this.options.screen === PebScreen.Mobile
  }

  get isDesktop(): boolean {
    return this.options.screen === PebScreen.Desktop;
  }

  addToCart() {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.product.addToCart(this.context.data));
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }
}
