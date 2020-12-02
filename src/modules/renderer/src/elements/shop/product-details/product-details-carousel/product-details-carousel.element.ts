import {
  AfterViewInit,
  Component,
  ElementRef, 
  HostBinding,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SafeStyle } from '@angular/platform-browser';

import { PebElementContext, PebElementContextState, PebElementDef, PebElementStyles } from '@pe/builder-core';

import { PebAbstractElement } from '../../../_abstract/abstract.element';

interface ProductElement extends PebElementDef {
  variant: 'link'|'purchase';
}

type ProductDetailsCarouselContext = PebElementContext<{
  images: string[];
}>;

@Component({
  selector: 'shop-product-details-carousel',
  templateUrl: './product-details-carousel.element.html',
  styleUrls: ['./product-details-carousel.element.scss'],
})
export class PebShopProductDetailsCarouselElement extends PebAbstractElement implements AfterViewInit, OnChanges{
  @Input() element: ProductElement;
  @Input() styles: PebElementStyles;
  @Input() context: ProductDetailsCarouselContext;
  @Input() set activeProduct(product: any) {
    this.images = product?.images?.length ? product?.images : this.context.data?.images;
    this.cdr.detectChanges();
  };

  images: string[];

  ElementContextState = PebElementContextState;

  activeSlideIndex$ = new BehaviorSubject<number>(0);

  slideWidth = 400;
  slideHeight = 650;

  @ViewChild('slidesContainerRef') slidesContainerRef: ElementRef;
  @ViewChild('controlsContainerRef') controlsContainerRef: ElementRef;

  private zoom = { x: 0, y: 0 };
  private scale = 2.5;
  private hovered = false;

  get containerHeight(): string {
    if (this.context.state !== PebElementContextState.Ready) {
      return;
    }

    return `${this.context.data.images.length * this.slideHeight}px`;
  }

  get slidesPosition(): string {
    return `${-(this.slideHeight * this.activeSlideIndex$.value)}px`;
  }

  get scaleStyle(): SafeStyle {
    const scale = this.hovered ? this.scale : 1;
    return this.sanitizer.bypassSecurityTrustStyle(`scale(${scale})`);
  }

  get zoomStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`${this.zoom.x}% ${this.zoom.y}%`);
  }

  getBackgroundImage(slide: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url("${slide.replace(/ /g, '%20')}")`);
  }

  clickSlideControl(slide: number): void {
    this.activeSlideIndex$.next(slide);
  }

  zoomImage(e: MouseEvent): void {
    if (!e) {
      this.hovered = false;
      return;
    }

    if (!this.hovered) {
      this.hovered = true;
    }

    this.zoom = {
      x: (e.offsetX) / this.slideWidth * 100,
      y: (e.offsetY) / this.slideHeight * 100,
    };
  }

  get elements(): { [key: string]: HTMLElement | HTMLElement[]} {
    return {
      host: this.nativeElement,
      slidesContainer: this.slidesContainerRef?.nativeElement,
      controlsContainer: this.controlsContainerRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;

    return {
      host: {
        position: 'relative',
        height: this.styles.height
          ? +this.styles.height * scale + 'px'
          : null,
        left: this.styles.left
          ? (this.styles.left as number * scale) + 'px'
          : null,
        top: this.styles.to
          ? (this.styles.top as number * scale) + 'px'
          : null,
      },
      slidesContainer: {
        width: this.slideWidth * scale + 'px',
        height: this.slideHeight * scale + 'px',
      },
      controlsContainer: {
        width: 85 * scale + 'px',
      },
    };
  }

  @HostBinding('class')
  get hostClass() {
    return 'state-' + this.context?.state;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.options?.previousValue !== changes.options?.currentValue) {
      this.applyStyles();
    }
  }

  public ngAfterViewInit(): void {
    this.applyStyles();
  }
}
