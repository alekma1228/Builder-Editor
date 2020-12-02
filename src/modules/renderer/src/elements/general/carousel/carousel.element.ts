import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebElementDef, PebElementStyles } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';
import { PebRightArrowIcon } from '../../icons/right-arrow.icon';
import { PebLeftArrowIcon } from '../../icons/left-arrow.icon';

export interface PebElementCarousel extends PebElementDef {
  data: {
    images: string[];
  };
}

@Component({
  selector: 'peb-element-carousel',
  templateUrl: './carousel.element.html',
  styleUrls: ['./carousel.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebCarouselElement extends PebAbstractElement implements OnInit {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @ViewChild('spinnerWrapper') spinnerWrapperRef: ElementRef<HTMLElement>;

  private player: AnimationPlayer;
  private readonly controlsSize = 42;
  private readonly fontSize = 13;

  private readonly currentSlideSubject$ = new BehaviorSubject<number>(0);
  readonly currentSlide$ = this.currentSlideSubject$.asObservable();

  set currentSlide(val: number) {
    this.currentSlideSubject$.next(val);
  }

  get currentSlide() {
    return this.currentSlideSubject$.value;
  }

  @ViewChild('carousel') private carousel: ElementRef;
  @ViewChildren('control') private controls: QueryList<ElementRef>;
  @ViewChildren('controlIcon') private controlsIcons: QueryList<PebLeftArrowIcon | PebRightArrowIcon>;

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      wrapper: this.carousel ? this.carousel.nativeElement : null,
      controls: this.controls ? this.controls.toArray().map(a => a.nativeElement) : null,
      controlsIcons: this.controlsIcons ? this.controlsIcons.toArray().map(a => a.elementRef.nativeElement) : null,
      spinnerWrapper: this.spinnerWrapperRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const {scale} = this.options;

    return {
      host: {
        width: this.styles.width
          ? (+this.styles.width * scale) + 'px'
          : '100%',
        height: this.styles.height
          ? (+this.styles.height * scale) + 'px'
          : '100%',
      },
      wrapper: {
        width: this.getCarouselWidth(),
      },
      controls: {
        width: (this.controlsSize * scale) + 'px',
        height: (this.controlsSize * scale) + 'px',
      },
      controlsIcons: {
        width: (9 * scale) + 'px',
        height: (16 * scale) + 'px',
      },
      spinnerWrapper: {
        fontSize: this.fontSize * scale + 'px',
      },
    };
  }

  ngOnInit() {
    this.currentSlide$.pipe(
      tap(() => {
        if (this.carousel) {
          this.transitionCarousel();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getImage(src: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${src}')`);
  }

  getCarouselWidth() {
    if (!this.element.data.images || !this.element.data.images.length) {
      return;
    }
    return `calc(100% * ${this.element.data.images.length})`;
  }

  nextSlide(event: Event) {
    event.preventDefault();

    if (this.currentSlide === this.element.data.images.length - 1) {
      const arr = [...this.element.data.images];
      const first = arr.shift();
      this.element.data.images = [...arr, first];

      this.currentSlide--;
      this.transitionCarousel(0);
    }

    this.currentSlide = (this.currentSlide + 1) % this.element.data.images.length;
    this.transitionCarousel();
  }

  previousSlide(event: Event) {
    event.preventDefault();

    if (this.currentSlide === 0) {
      const last = this.element.data.images.pop();
      this.element.data.images = [last, ...this.element.data.images];

      this.currentSlide++;
      this.transitionCarousel(0);
    }

    this.currentSlide = (this.currentSlide - 1 + this.element.data.images.length) % this.element.data.images.length;
    this.transitionCarousel();
  }

  transitionCarousel(time?: number) {
    const offset = this.currentSlide * this.nativeElement.offsetWidth;
    const myAnimation: AnimationFactory = this.buildAnimation(offset, time);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

  private buildAnimation(offset: number, time: number) {
    return this.animationBuilder.build([
      animate(time !== undefined ? time : '250ms ease-in', style({ transform: `translateX(-${offset}px)`} )),
    ]);
  }
}
