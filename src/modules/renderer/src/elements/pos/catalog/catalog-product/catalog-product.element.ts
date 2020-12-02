import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  transformStyleProperty,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';
import { PebAbstractElement } from '../../../_abstract/abstract.element';

type CatalogProductContext = PebElementContext<any>;

enum DisplayModes {
  GRID = 'grid',
  TABLE = 'table',
}

@Component({
  selector: 'pos-catalog-product',
  templateUrl: './catalog-product.element.html',
  styleUrls: ['./catalog-product.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPosCatalogProductElement extends PebAbstractElement implements AfterViewInit, OnChanges {
  @Input() context: CatalogProductContext;
  @Input() options: PebRendererOptions;

  // payload - product id
  @Output() navigateToPage: EventEmitter<number> = new EventEmitter();

  @ViewChild('imageRef') imageRef: ElementRef;
  @ViewChild('priceRef') priceRef: ElementRef;
  @ViewChild('titleRef') titleRef: ElementRef;

  //TODO(@mivnv) Fix dublication elements

  @ViewChild('tableImageRef') tableImageRef: ElementRef;
  @ViewChild('tablePriceRef') tablePriceRef: ElementRef;
  @ViewChild('tableTitleRef') tableTitleRef: ElementRef;

  PebElementContextState = PebElementContextState;
  defaultProductImage = '/assets/showcase-images/products/fill-1.svg';
  defaultFontFamily = 'Roboto';
  defaultFontSize = 12;
  defaultColor = '#000000';
  defaultImageBackgroundSize = '27%'; // otherwise default image will display incorrectly
  DisplayModes = DisplayModes;


  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      image: this.imageRef?.nativeElement,
      price: this.priceRef?.nativeElement,
      title: this.titleRef?.nativeElement,
      tableImage: this.tableImageRef?.nativeElement,
      tablePrice: this.tablePriceRef?.nativeElement,
      tableTitle: this.tableTitleRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;
    const image = this.context.data.image || this.defaultProductImage;

    //TODO(Maxim Andruh): Remove custom styles

    return {
      host: {
        borderColor: this.styles?.borderColor,
      },
      image: {
        backgroundImage: image ? `url('${image}')` : null,
        backgroundSize: !this.context.data.image
          ? this.defaultImageBackgroundSize
          : '',
        borderRadius: transformStyleProperty(this.styles.borderRadius, 1),
      },
      price: {
        color: this.styles.priceColor,
        textDecoration: this.styles.priceTextDecoration ?? null,
        fontWeight: this.styles.priceFontWeight,
        fontStyle: this.styles.priceFontStyle ?? null,
        fontFamily: this.styles.priceFontFamily ?? this.defaultFontFamily,
        fontSize: transformStyleProperty(this.styles.priceFontSize ?? this.defaultFontSize, scale),
        display: this.element.data?.hideProductPrice ? 'none' : 'block',
      },
      title: {
        color: this.styles.titleColor,
        textDecoration: this.styles.titleTextDecoration ?? null,
        fontWeight: this.styles.titleFontWeight ?? null,
        fontStyle: this.styles.titleFontStyle ?? null,
        fontFamily: this.styles.titleFontFamily ?? this.defaultFontFamily,
        fontSize: transformStyleProperty(this.styles.titleFontSize ?? this.defaultFontSize, scale),
        display: this.element.data?.hideProductName ? 'none' : 'block',
      },
      tableImage: {
        backgroundImage: image ? `url('${image}')` : null,
        backgroundSize: !this.context.data.image
          ? this.defaultImageBackgroundSize
          : '',
        borderRadius: transformStyleProperty(this.styles.borderRadius, 1),
      },
      tablePrice: {
        color: this.styles.priceColor,
        textDecoration: this.styles.priceTextDecoration ?? null,
        fontWeight: this.styles.priceFontWeight,
        fontStyle: this.styles.priceFontStyle ?? null,
        fontFamily: this.styles.priceFontFamily ?? this.defaultFontFamily,
        fontSize: transformStyleProperty(this.styles.priceFontSize ?? this.defaultFontSize, scale),
        display: this.element.data?.hideProductPrice ? 'none' : 'block',
      },
      tableTitle: {
        color: this.styles.titleColor,
        textDecoration: this.styles.titleTextDecoration ?? null,
        fontWeight: this.styles.titleFontWeight ?? null,
        fontStyle: this.styles.titleFontStyle ?? null,
        fontFamily: this.styles.titleFontFamily ?? this.defaultFontFamily,
        fontSize: transformStyleProperty(this.styles.titleFontSize ?? this.defaultFontSize, scale),
        display: this.element.data?.hideProductName ? 'none' : 'block',
      },
    };
  }

  get loading(): boolean {
    return this.context?.state === PebElementContextState.Loading;
  }

  get displayMode(): DisplayModes {
    return this.context?.data.displayMode ?? DisplayModes.GRID;
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }

  @HostListener('click')
  openProductPage() {
    if (!this.options.interactions) {
      return;
    }

    this.navigateToPage.emit(this.context.data.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.applyStyles();
  }

  ngAfterViewInit() {
    this.applyStyles();
  }
}
