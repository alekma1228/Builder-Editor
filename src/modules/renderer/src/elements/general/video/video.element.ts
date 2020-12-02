import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { PebElementDef, PebElementStyles, transformStyleProperty } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';

@Component({
  selector: 'peb-element-video',
  templateUrl: './video.element.html',
  styleUrls: ['./video.element.scss'],
})
export class PebVideoElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  // private readonly defaultWidth = 1024;
  // private readonly defaultHeight = 720;
  private readonly fontSize = 13;

  videoLoaded = false;

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      video: this.video?.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;
    const { styles } = this;

    return {
      host: {
        position: 'relative',
        display: styles.display ?? 'block',
        borderStyle: this.styles.borderStyle ? this.styles.borderStyle : null,
        borderColor: this.styles.borderColor ? this.styles.borderColor : null,
        boxShadow: this.styles.boxShadow ? this.styles.boxShadow : null,
        transform: this.styles.transform ? this.styles.transform : null,
        fontSize: this.fontSize * scale + 'px',

        width: styles.width ? transformStyleProperty(styles.width, scale) : 'max-content',
        height: styles.height ? transformStyleProperty(styles.height, scale) : 'max-content',

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
        ...('padding' in styles && { padding: transformStyleProperty(styles.padding, scale) }),

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),
      },
      video: {
        opacity: styles.opacity,
        objectFit: styles.objectFit || 'contain',
        visibility: this.element.data?.isLoading ? 'hidden' : 'visible',
      }
    };
  }

  onLoaded(): void {
    this.videoLoaded = true;
  }

}
