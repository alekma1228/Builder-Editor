import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnChanges, ViewChild } from '@angular/core';
import { animate, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';

import { PebElementContext, PebElementDef, PebElementStyles, PebScreen } from '@pe/builder-core';

import { PebAbstractElement } from '../../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../../renderer.types';

interface ProductElement extends PebElementDef {
  variant: 'link'|'purchase';
}

type ProductDetailsCarouselContext = PebElementContext<{
  images: string[];
}>;

const DEFAULT_WIDTH = {
  [PebScreen.Desktop]: 445,
  [PebScreen.Tablet]: 375,
  [PebScreen.Mobile]: 375,
};

const DEFAULT_HEIGHT = {
  [PebScreen.Desktop]: 375,
  [PebScreen.Tablet]: 375,
  [PebScreen.Mobile]: 350,
};

@Component({
  selector: 'shop-product-details-mobile-carousel',
  templateUrl: './product-details-mobile-carousel.element.html',
  styleUrls: ['./product-details-mobile-carousel.element.scss'],
})
export class PebShopProductDetailsMobileCarouselElement extends PebAbstractElement implements OnChanges, AfterViewInit {
  @Input() element: ProductElement;
  @Input() styles: PebElementStyles;
  @Input() set context(context: ProductDetailsCarouselContext) {
    this.currentSlide = 0;
    this.cachedContext = context;
    this.imagesStack = context?.data?.images;
  }
  @Input() options: PebRendererOptions;

  @Input() setBackgroundSize: boolean;
  @Input() backgroundSize: string;

  @Input() set activeProduct(product: any) {
    this.currentSlide = 0;
    this.imagesStack = product?.images?.length ? product?.images : this.cachedContext?.data?.images;
    this.cdr.detectChanges();
  };

  private cachedContext = null;

  defaultWidth = 380;
  defaultHeight = 380;

  widthSubject$ = new BehaviorSubject<number>(
    DEFAULT_WIDTH[PebScreen.Desktop]
  );
  heightSubject$ = new BehaviorSubject<number>(
    DEFAULT_HEIGHT[PebScreen.Desktop]
  );

  @ViewChild('carouselRef') private carousel: ElementRef;

  public imagesStack: string[] ;

  public currentSlide: number;
  private player: AnimationPlayer;

  ngOnChanges() {
    this.widthSubject$.next(
      DEFAULT_WIDTH[this.options?.screen || PebScreen.Desktop] * (this.options?.scale || 1),
    );
    this.heightSubject$.next(
      DEFAULT_HEIGHT[this.options?.screen || PebScreen.Desktop] * (this.options?.scale || 1),
    );
  }

  getImage(src: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url("${src.replace(/ /g, '%20')}")`);
  }

  get carouselWidth() {
    return `${this.widthSubject$.value * this.imagesStack?.length}px`;
  }

  next() {
    const lastSlide = this.currentSlide === Math.ceil((this.imagesStack.length - 1) / 2);
    if (lastSlide) {
      const first = this.imagesStack.shift();
      this.imagesStack = [...this.imagesStack, first];

      this.currentSlide--;
      this.transitionCarousel(0);
    }

    this.currentSlide = (this.currentSlide + 1 + this.imagesStack.length) % this.imagesStack.length;
    this.transitionCarousel();
  }

  prev() {
    const firstSlide = this.currentSlide === 0;
    if (firstSlide) {
      const last = this.imagesStack.pop();
      this.imagesStack = [last, ...this.imagesStack];

      this.currentSlide++;
      this.transitionCarousel(0);
    }

    this.currentSlide = (this.currentSlide - 1 + this.imagesStack.length) % this.imagesStack.length;
    this.transitionCarousel();
  }

  transitionCarousel(time?: number) {
    const offset = this.currentSlide * this.widthSubject$.value;
    const myAnimation: AnimationFactory = this.buildAnimation(offset, time);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

  private buildAnimation(offset: number, time: number) {
    return this.animationBuilder.build([
      animate(time !== undefined ? time : '250ms ease-in', style({ transform: `translateX(-${offset}px)` })),
    ]);
  }

  get elements(): { [key: string]: HTMLElement | HTMLElement[]} {
    return {
      host: this.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;

    return {
      host: {
        position: 'relative',
        width: `${this.widthSubject$.value}px`,
        height: `${this.heightSubject$.value}px`,
        left: this.styles.left
          ? (this.styles.left as number * scale) + 'px'
          : null,
        top: this.styles.top
          ? (this.styles.top as number * scale) + 'px'
          : null,
      },
    };
  }

  ngAfterViewInit() {
    this.applyStyles();
  }

  @HostBinding('class')
  get hostClass() {
    return 'state-' + this.context?.state;
  }
}
