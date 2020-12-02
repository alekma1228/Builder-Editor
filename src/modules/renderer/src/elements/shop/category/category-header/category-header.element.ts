import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  PebElementDef,
  PebElementStyles,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';
import { PebAbstractElement } from '../../../_abstract/abstract.element';

@Component({
  selector: 'shop-category-header',
  templateUrl: './category-header.element.html',
  styleUrls: ['./category-header.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopCategoryHeaderElement extends PebAbstractElement implements AfterViewInit, OnChanges {
  @Input() context: PebElementContext<any>;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;
  @Input() element: PebElementDef;

  @ViewChild('imageRef') imageRef: ElementRef;
  @ViewChild('titleRef') titleRef: ElementRef;

  PebElementContextState = PebElementContextState;
  defaultCategoryImage = '/assets/showcase-images/products/combined-shape.svg';
  defaultFontFamily = 'Roboto';
  defaultFontSize = 24;
  defaultColor = '#000000';
  defaultImageBackgroundSize = '14%';


  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      image: this.imageRef?.nativeElement,
      title: this.titleRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;
    const image = this.defaultCategoryImage;

    //TODO(Maxim Andruh): Remove custom styles

    return {
      host: {
        borderColor: this.styles?.borderColor,
        display: this.styles.categoryHeaderDisplay || 'flex',
      },
      image: {
        backgroundImage:
          this.context.state === PebElementContextState.Ready
            ? `url('${image}')`
            : null,
        backgroundSize: !this.context.data.image
          ? this.defaultImageBackgroundSize
          : 'contain',
      },
      title: {
        color: this.styles.categoryTitleColor || this.defaultColor,
        textDecoration: this.styles.categoryTitleTextDecoration || null,
        fontWeight: this.styles.categoryTitleFontWeight || 'normal',
        fontStyle: this.styles.categoryTitleFontStyle || null,
        fontFamily:
          this.styles.categoryTitleFontFamily || this.defaultFontFamily,
        fontSize:
          (+this.styles.categoryTitleFontSize || this.defaultFontSize) * scale +
          'px',
      },
    };
  }

  // TODO: return after checking renderer's styling.
  ngAfterViewInit() {
    this.applyStyles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.styles) {
      this.applyStyles();
    }
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }
}
