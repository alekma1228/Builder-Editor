import { Component, HostListener, Input } from '@angular/core';
import { sum } from 'lodash';

import {
  PebElementContext,
  PebElementContextState,
  PebElementDef,
  PebElementStyles,
  PebInteractionCreator,
  transformStyleProperty,
} from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';

type CartContext = PebElementContext<
  {
    count: number;
    product: any;
  }[]
>;

@Component({
  selector: 'peb-element-shop-cart',
  templateUrl: './cart.element.html',
  styleUrls: ['../../_abstract/abstract.element.scss', './cart.element.scss'],
})
export class PebShopCartElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() context: CartContext;

  PebElementContextState = PebElementContextState;
  defaultColor = 'black';

  static contextFetcher(ctx) {
    return ctx['@cart'];
  }

  get elements(): { [key: string]: HTMLElement } {
    return {
      host: this.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;

    return {
      host: {
        display: 'block',
        position: this.styles.position ?? 'relative',
        color: this.styles.color,
        fontSize: transformStyleProperty(this.styles.fontSize, scale),
        transform: this.styles.transform ?? null,
        top: this.styles.top ? +this.styles.top * scale + 'px' : '0px',
        left: this.styles.left ? +this.styles.left * scale + 'px' : '0px',
        width: transformStyleProperty(this.styles.width, scale),
        height: transformStyleProperty(this.styles.height, scale),
        filter: this.styles.filterShadow ? this.styles.filterShadow : null,

        ...('gridArea' in this.styles && { gridArea: this.styles.gridArea }),
        ...('gridRow' in this.styles && { gridRow: this.styles.gridRow }),
        ...('gridColumn' in this.styles && { gridColumn: this.styles.gridColumn }),

        ...('margin' in this.styles && { margin: transformStyleProperty(this.styles.margin, scale) }),
        ...('marginTop' in this.styles && { marginTop: transformStyleProperty(this.styles.marginTop, scale) }),
        ...('marginRight' in this.styles && { marginRight: transformStyleProperty(this.styles.marginRight, scale) }),
        ...('marginBottom' in this.styles && { marginBottom: transformStyleProperty(this.styles.marginBottom, scale) }),
        ...('marginLeft' in this.styles && { marginLeft: transformStyleProperty(this.styles.marginLeft, scale) }),

        ...('padding' in this.styles && { padding: transformStyleProperty(this.styles.padding, scale) }),
      },
    };
  }

  get totalItems(): number {
    return sum(this.context?.data?.map(i => i.count));
  }

  get borderWidth() {
    return this.styles.borderWidth
      ? (+this.styles.borderWidth / 2) * this.options.scale
      : null;
  }

  get backgroundColor(): string {
    return (this.styles.backgroundColor || this.defaultColor) as string;
  }

  @HostListener('click', ['$event'])
  onOpenCart(): void {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.cart.click());
  }
}
