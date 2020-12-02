import { Component, Input } from '@angular/core';

import { PebElementDef, PebElementStyles, transformStyleProperty } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';
import { getBackgroundImage } from '../../../utils';

@Component({
  selector: 'peb-element-block',
  templateUrl: './block.element.html',
  styleUrls: [
    './block.element.scss',
    '../../_abstract/abstract.element.scss',
  ],
})
export class PebBlockElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  get elements(): { [key: string]: HTMLElement } {
    return {
      host: this.nativeElement,
    };
  }

  get contentContainer(): HTMLElement {
    return this.elements.host;
  }

  get mappedStyles() {
    const { styles } = this;
    const { scale } = this.options;

    return {
      host: {
        display: styles.display || 'block',

        ...('gridTemplateRows' in styles &&
          { gridTemplateRows: transformStyleProperty(styles.gridTemplateRows, scale) }
        ),
        ...('gridTemplateColumns' in styles &&
          { gridTemplateColumns: transformStyleProperty(styles.gridTemplateColumns, scale) }
        ),

        ...('top' in styles && { top: transformStyleProperty(styles.top, scale) }),
        ...('bottom' in styles && { bottom: transformStyleProperty(styles.bottom, scale) }),
        zIndex: styles.zIndex !== undefined ? styles.zIndex : null,
        flexDirection: styles.flexDirection || null,
        flexWrap: styles.flexWrap || null,
        justifyContent: styles.justifyContent || null,
        alignItems: styles.alignItems || null,
        overflow: styles.overflow || null,
        position: styles.position || 'relative',
        width: styles.width
          ? (styles.width).toString().includes('%')
            ? styles.width
            : +styles.width * scale + 'px'
          : null,
        height: styles.height
          ? (styles.height).toString().includes('%')
            ? styles.height
            : +styles.height * scale + 'px'
          : null,
        backgroundColor: styles.backgroundColor || null,
        backgroundRepeat: styles.backgroundRepeat || null,
        backgroundImage: getBackgroundImage(styles.backgroundImage as string),
        backgroundSize: styles.backgroundSize
          ? typeof styles.backgroundSize === 'number'
            ? styles.backgroundSize * scale + 'px'
            : styles.backgroundSize
          : null,
        backgroundPosition: styles.backgroundPosition || null,

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),

        padding: styles.padding ? transformStyleProperty(styles.padding, scale) : null,
        opacity: styles.opacity || styles.opacity === 0 ? styles.opacity : null,
        transform: styles.transform ? styles.transform : null,
        borderStyle: styles.borderStyle ? styles.borderStyle : null,
        borderColor: styles.borderColor ? styles.borderColor : null,
        ...('borderWidth' in styles && { borderWidth: transformStyleProperty(styles.borderWidth, scale) }),
        filter: styles.shadow ? styles.shadow : null,
        visibility: this.styles.visibility || 'visible',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),
      },
    };
  }

}
