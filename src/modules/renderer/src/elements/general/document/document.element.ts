import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';

import { PebElementDef } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';
import { getBackgroundImage } from '../../../utils';

const BG_GRADIENT = 'linear-gradient';

@Component({
  selector: 'peb-element-document',
  templateUrl: './document.element.html',
  styleUrls: [
    '../../_abstract/abstract.element.scss',
    './document.element.scss',
  ],
})
export class PebDocumentElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() context: null;
  @Input() options: PebRendererOptions;

  protected get elements() {
    return {
      host: this.nativeElement,
    };
  }

  protected get mappedStyles() {
    let bgImage = null;
    if (this.styles.backgroundImage) {
      bgImage = getBackgroundImage(this.styles.backgroundImage as string);
    }
    return {
      host: {
        backgroundRepeat: this.styles.backgroundRepeat ? this.styles.backgroundRepeat : 'no-repeat',
        backgroundImage: bgImage,
        backgroundSize: this.styles.backgroundSize
          ? this.styles.backgroundSize
          : null,
        backgroundPosition: this.styles.backgroundPosition
          ? this.styles.backgroundPosition
          : null,
        backgroundColor: this.styles.backgroundColor
          ? this.styles.backgroundColor
          : null,
      },
    };
  }
}
