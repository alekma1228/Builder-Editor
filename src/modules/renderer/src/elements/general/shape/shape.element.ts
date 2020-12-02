import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { PebElementContext, PebElementStyles, transformStyleProperty } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';
import { PebElementShape, PebShapeVariant } from './shape.constants';
import { getBackgroundImage, getGradientProperties, isBackgroundGradient } from '../../../utils';

@Component({
  selector: 'peb-element-shape',
  templateUrl: './shape.element.html',
  styleUrls: ['./shape.element.scss'],
})
export class PebShapeElement extends PebAbstractElement {
  PebShapeVariant = PebShapeVariant;

  @Input() element: PebElementShape;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;
  @Input() context: PebElementContext<any>;

  @ViewChild('shape') shapeEl: ElementRef;

  triangleStyles = {
    fill: '#d8d8d8',
    strokeWidth: 3,
    borderColor: 'black',
    strokeDasharray: 0,
    gradientStartColor: 'white',
    gradientStopColor: 'black',
    isGradient: false,
    gradientAngle: {
      x1: '1',
      x2: '1',
      y1: '1',
      y2: '1',
    },
  };

  get elements(): { [key: string]: HTMLElement | HTMLElement[]; } {
    return {
      host: this.nativeElement,
      shape: this.shapeEl?.nativeElement,
    };
  }

  get potentialContainer() {
    return this.element.data.variant === 'square'
      ? this.nativeElement
      : null;
  }

  get mappedStyles(): any {
    const { scale } = this.options;
    const { styles } = this;

    // TODO: After adding styles for shape's text check that text size is properly scales
    return {
      host: {
        width: `${+this.styles.width * scale }px`,
        height: `${+this.styles.height * scale }px`,
        left: this.styles.left ? (this.styles.left as number * scale) + 'px' : null,
        top: this.styles.top ? (this.styles.top as number * scale) + 'px' : null,
        filter: this.styles.shadow ? this.styles.shadow : null,
        fontSize: this.options.scale + 'rem',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: transformStyleProperty(styles.marginTop, scale) }),
        ...('marginRight' in styles && { marginRight: transformStyleProperty(styles.marginRight, scale) }),
        ...('marginBottom' in styles && { marginBottom: transformStyleProperty(styles.marginBottom, scale) }),
        ...('marginLeft' in styles && { marginLeft: transformStyleProperty(styles.marginLeft, scale) }),
      },
      shape: this.getShapeStyle(),
    };
  }

  private getShapeStyle() {
    if (this.element.data?.variant === PebShapeVariant.Triangle) {
      return this.getTriangleStyles();
    } else {
      return this.getCircleOrSquareStyles();
    }
  }

  private getCircleOrSquareStyles() {
    const { scale } = this.options;
    return {
      backgroundColor: this.styles.backgroundColor ? this.styles.backgroundColor : null,
      borderStyle: this.styles.borderStyle ? this.styles.borderStyle : null,
      borderColor: this.styles.borderColor ? this.styles.borderColor : null,
      borderWidth: this.styles.borderWidth ? (this.styles.borderWidth as number * scale) + 'px' : null,
      opacity: this.styles.opacity || this.styles.opacity === 0 ? this.styles.opacity : null,
      transform: this.styles.transform ? this.styles.transform : null,
      backgroundSize: this.styles.backgroundSize ? this.styles.backgroundSize : null,
      backgroundImage: this.styles.backgroundImage ? getBackgroundImage(this.styles.backgroundImage.toString()) : null,
    };
  }

  private getTriangleStyles() {
    if (this.styles.backgroundImage) {
      this.triangleStyles.isGradient = isBackgroundGradient(this.styles.backgroundImage.toString());
    }
    this.triangleStyles.fill = this.triangleStyles.isGradient
      ? `url(#gradient-${this.element.id})`
      : (this.styles.backgroundColor
        ? this.styles.backgroundColor
        : '#d8d8d8') as string;
    this.triangleStyles.strokeWidth = (this.styles.borderWidth ? this.styles.borderWidth : 0) as number;
    this.triangleStyles.borderColor = (this.styles.borderColor ? this.styles.borderColor : 'black') as string;
    this.triangleStyles.strokeDasharray = (this.styles.borderOffset ? this.styles.borderOffset : 0) as number;

    if (this.triangleStyles.isGradient) {
      const gradientProps = getGradientProperties(this.styles);
      this.triangleStyles.gradientStartColor = gradientProps.startColor ? gradientProps.startColor : null;
      this.triangleStyles.gradientStopColor = gradientProps.endColor ? gradientProps.endColor : null;
      this.triangleStyles.gradientAngle = this.calcGradientAngle(gradientProps.angle);
    }

    return {
      opacity: this.styles.opacity || this.styles.opacity === 0 ? this.styles.opacity : null,
      transform: this.styles.transform ? this.styles.transform : null,
    };
  }

  private calcGradientAngle(angle: number) {
    const anglePI = angle * (Math.PI / 180);

    return {
      x1: Math.round(50 + Math.sin(anglePI) * 50) + '%',
      y1: Math.round(50 + Math.cos(anglePI) * 50) + '%',
      x2: Math.round(50 + Math.sin(anglePI + Math.PI) * 50) + '%',
      y2: Math.round(50 + Math.cos(anglePI + Math.PI) * 50) + '%',
    };
  }
}
