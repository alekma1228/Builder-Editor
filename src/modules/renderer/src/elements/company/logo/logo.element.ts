import { Component, ElementRef, HostBinding, HostListener, Input, ViewChild } from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  PebElementDef,
  PebElementStyles,
  PebInteractionCreator,
  transformStyleProperty,
} from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';

@Component({
  selector: 'peb-element-logo',
  templateUrl: './logo.element.html',
  styleUrls: ['./logo.element.scss'],
})
export class PebLogoElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() context: PebElementContext<{
    src: string;
    name: string;
  }>;

  PebElementContextState = PebElementContextState;

  @ViewChild('wrapper') wrapperRef: ElementRef;
  @ViewChild('image') imageRef: ElementRef<HTMLImageElement>;

  static contextFetcher(ctx) {
    return ctx['#logo'];
  }

  get elements(): { [key: string]: HTMLElement} {
    return {
      host: this.nativeElement,
      wrapper: this.wrapperRef.nativeElement,
      image: this.imageRef.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;
    const { styles } = this;

    return {
      host: {
        position: 'relative',
        width: transformStyleProperty(styles.width || '100%', scale),
        height: transformStyleProperty(styles.height || '100%', scale),
        cursor: this.options.interactions ? 'pointer' : 'initial',

        ...('color' in styles && { color: styles.color }),
        ...('border' in styles && { border: styles.border }),
        ...('filter' in styles && { filter: styles.filter }),
        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),
        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
        ...('padding' in styles && { padding: transformStyleProperty(styles.padding, scale) }),
      },
      wrapper: {
        display: styles.display ?? 'block',
        ...('opacity' in styles && { opacity: styles.opacity }),
      },
      image: {
        objectFit: styles.objectFit ?? 'contain',
      },
    };
  }

  @HostListener('click')
  onClick() {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.navigate.internal('/'));
  }

  @HostBinding('class.interactions')
  get classFrontPage(): boolean {
    return this.options.interactions;
  }
}
