import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import { PebElementDef, PebElementStyles } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';

@Component({
  selector: 'peb-element-html',
  templateUrl: './html.element.html',
  styleUrls: ['./html.element.scss'],
})
export class PebHtmlElement extends PebAbstractElement implements AfterViewInit {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @ViewChild('htmlContainer') htmlContainer: ElementRef;

  get elements(): { [key: string]: HTMLElement | HTMLElement[]} {
    return {
      host: this.nativeElement,
      htmlContainer: this.htmlContainer?.nativeElement,
    };
  }

  get mappedStyles() {
    return {
      host: {
        position: 'relative',
        transform: this.styles.rotate || this.styles.opacity === 0 || this.styles.scaleX || this.styles.scaleY
          ? `rotate(-${this.styles.rotate || 0}deg) scale(${this.styles.scaleX || 1}, ${this.styles.scaleY || 1})`
          : null,
        width: this.styles.width
          ? (+this.styles.width * this.options.scale)  + 'px'
          : '100%',
        height: this.styles.height
          ? (+this.styles.height * this.options.scale) + 'px'
          : '100%',
        padding: `${+this.styles.padding * this.options.scale}px`,
        margin: this.styles.margin || null,
      },
      htmlContainer: {
        transformOrigin: `top left`,
      },
    };
  }

  ngAfterViewInit() {
    this.applyStyles();
  }

  get safeHTML(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.element.data.innerHTML);
  }
}
