import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  PebElementStyles,
  PebInteractionCreator,
  PEB_DEFAULT_FONT_SIZE,
  transformStyleProperty,
} from '@pe/builder-core';

import { PebAbstractElement } from '../../../_abstract/abstract.element';
import { PebProduct } from '../products.element';

type ProductContext = PebElementContext<PebProduct>;

const defaultTitleColor = '#000';
const defaultPriceColor = '#a5a5a5';

@Component({
  selector: 'peb-element-shop-product',
  templateUrl: './product.element.html',
  styleUrls: ['./product.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopProductElement extends PebAbstractElement implements AfterViewInit, OnChanges {
  @Input() context: ProductContext;
  @Input() styles: PebElementStyles;

  @ViewChild('imageRef') imageRef: ElementRef;
  @ViewChild('priceRef') priceRef: ElementRef;
  @ViewChild('titleRef') titleRef: ElementRef;

  PebElementContextState = PebElementContextState;

  get elements(): { [key: string]: HTMLElement | HTMLElement[]} {
    return {
      host: this.nativeElement,
      image: this.imageRef?.nativeElement,
      price: this.priceRef?.nativeElement,
      title: this.titleRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const styles = this.styles;
    const { scale } = this.options;

    return {
      host: {},
      image: {
        backgroundImage: this.context.state === PebElementContextState.Ready && this.context.data.images?.length
          ? `url('${this.context.data.images[0]}')`
          : null,
          ...('borderRadius' in this.styles && { borderRadius: this.styles.borderRadius + 'px' }),
      },
      title: {
        ...('titleFontSize' in this.styles && { fontSize: transformStyleProperty(styles.titleFontSize, scale) }),
        ...('titleColor' in this.styles && { color: this.styles.titleColor }),
        ...('titleFontFamily' in this.styles && { fontFamily: this.styles.titleFontFamily }),
        ...('titleFontStyle' in this.styles && { fontStyle: this.styles.titleFontStyle }),
        ...('titleFontWeight' in this.styles && { fontWeight: this.styles.titleFontWeight }),
        ...('titleTextDecoration' in this.styles && { textDecoration: this.styles.titleTextDecoration }),
      },
      price: {
        ...('priceFontSize' in this.styles && { fontSize: transformStyleProperty(styles.priceFontSize, scale) }),
        ...('priceColor' in this.styles && { color: this.styles.priceColor }),
        ...('priceFontFamily' in this.styles && { fontFamily: this.styles.priceFontFamily }),
        ...('priceFontStyle' in this.styles && { fontStyle: this.styles.priceFontStyle }),
        ...('priceFontWeight' in this.styles && { fontWeight: this.styles.priceFontWeight }),
        ...('priceTextDecoration' in this.styles && { textDecoration: this.styles.priceTextDecoration }),
      },
    };
  }

  @HostListener('click')
  openProductPage() {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.product.navigateToPage(this.context.data.id));
  }

  ngAfterViewInit() {
    this.applyStyles();
  }

  ngOnChanges() {
    this.applyStyles();
  }

  // TODO: create a pipe
  getCurrencySign(currency: string): string {
    if (!currency) {
      return;
    }

    let sign: string;

    switch (currency) {
      case 'EUR':
        sign = '€';
        break;
      case 'USD':
        sign = '$';
        break;
      case 'GBP':
        sign = '£';
        break;
      case 'SEK':
        sign = 'kr'
      case 'DKK':
        sign = 'Kr.'
      case 'NOK':
        sign = 'kr'
      default:
        sign = currency;
    }

    return sign;
  }

}
