import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { PebElementDef, PebElementStyles, transformStyleProperty } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';

@Component({
  selector: 'peb-element-line',
  templateUrl: './line.element.html',
  styleUrls: ['./line.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebLineElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @ViewChild('lineRef') lineRef: ElementRef;

  get elements(): { [key: string]: HTMLElement } {
    return {
      host: this.nativeElement,
      line: this.lineRef?.nativeElement,
    };
  }
  get mappedStyles(): any {
    const { styles } = this;
    const { scale } = this.options;
    return  {
      host: {
        display: 'flex',
        margin: +styles.margin * scale + 'px',
        position: styles.position || 'relative',
        // left: styles.left
        //   ? (styles.left as number * scale) + 'px'
        //   : null,
        // top: styles.top
        //   ? (styles.top as number * scale) + 'px'
        //   : null,
        // transform: `rotate(${-1 * +styles.rotate}deg)`,
        backgroundColor: styles.wrapperBackground || null,
        width: styles.width ? +styles.width * scale + 'px' : '100%',
        height:  (+styles.height || 1) * scale + 'px',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
      },
      line: {
        width: '100%',
        height: '100%',
        backgroundColor: styles.backgroundColor ? styles.backgroundColor : '#474747',
        boxShadow: styles.shadowing ?
          `${+styles.shadowOffset * Math.cos(+styles.shadowAngle * Math.PI / 180) * scale}px
          ${+styles.shadowOffset * (-1) * Math.sin(+styles.shadowAngle * Math.PI / 180) * scale}px
          ${+styles.shadowBlur * scale}px
          0px
          ${this.getShadowColor({ ...this.hexToRgb(styles.shadowColor), opacity: styles.shadowOpacity })}` :
        null,
        opacity: +styles.opacity / 100,
      },
    };
  }

  private hexToRgb(hex): any {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  private getShadowColor({ r, g, b, opacity}): string {
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }
}
