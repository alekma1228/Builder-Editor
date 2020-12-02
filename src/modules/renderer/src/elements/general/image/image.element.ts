import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

import {
  PebElementDef,
  PebElementStyles,
  PebInteractionCreator,
  PebInteractionType,
  transformStyleProperty
} from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';

@Component({
  selector: 'peb-element-image',
  templateUrl: './image.element.html',
  styleUrls: [ './image.element.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebImageElement extends PebAbstractElement implements OnInit {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  private readonly fontSize = 13;

  loading = true;

  @ViewChild('image') imageRef: ElementRef<HTMLImageElement>;
  @ViewChild('defaultImage') defaultImageRef: ElementRef<HTMLImageElement>;

  ngOnInit() {
  }

  get elements(): { [ key: string ]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      image: this.imageRef?.nativeElement,
      defaultImage: this.defaultImageRef?.nativeElement,
    };
  }

  get potentialContainer() {
    return this.nativeElement;
  }

  get mappedStyles() {
    const { styles } = this;
    const { scale } = this.options;

    // TODO: Filter out nulls
    return {
      host: {
        display: styles.display ?? 'flex',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        color: styles.color,
        width: transformStyleProperty(styles.width, scale),
        height: transformStyleProperty(styles.height, scale),
        left: styles.left
          ? (styles.left as number) * scale + 'px'
          : null,
        right: styles.right
          ? (styles.right as number) * scale + 'px'
          : null,
        top: styles.top
          ? (styles.top as number) * scale + 'px'
          : null,
        bottom: styles.bottom
          ? (styles.bottom as number) * scale + 'px'
          : null,
        opacity:
          styles.opacity || styles.opacity === 0
            ? styles.opacity
            : null,
        transform:
          styles.rotate ||
          styles.opacity === 0 ||
          styles.scaleX ||
          styles.scaleY
            ? `rotate(-${styles.rotate || 0}deg) scale(${
              styles.scaleX || 1
            }, ${styles.scaleY || 1})`
            : null,
        filter: styles.filterShadow ? styles.filterShadow : null,
        cursor: this.element?.data?.link ? 'pointer' : 'initial',
        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
        flexDirection: styles.flexDirection || 'row',
        alignContent: styles.alignContent || 'auto',
        fontSize: this.fontSize * scale + 'px',
      },
      image: {
        border: styles.border ? styles.border : null,
        margin: styles.padding
          ? transformStyleProperty(styles.padding, scale)
          : null,
        objectFit: styles.objectFit || 'contain',
      },
    };
  }

  @HostListener('click')
  openProductPage() {
    if (!this.options.interactions || !this.element.data.action) {
      return;
    }

    const { payload, type } = this.element.data.action;

    const interaction =
      type === PebInteractionType.NavigateInternal
        ? PebInteractionCreator.navigate.internal(payload)
        : type === PebInteractionType.NavigateExternal
        ? PebInteractionCreator.navigate.external(payload)
        : null;

    if (!interaction) {
      console.warn('There is no interaction creator for: ', this.element.data);
      return;
    }

    this.interact(interaction);
  }

  loaded() {
    this.loading = false;
    this.cdr.detectChanges();
  }

  get src() {
    return this.styles?.background ?? this.element.data.src;
  }

  get doesHostHasSize(): boolean {
    return true;
  }

  get loadingInProgress(): boolean {
    return this.loading;
  }
}
