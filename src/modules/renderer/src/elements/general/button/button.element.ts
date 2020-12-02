import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import {
  PebElementDef,
  PebElementStyles,
  PebInteractionCreator,
  PebInteractionType,
  transformStyleProperty,
} from '@pe/builder-core';
import { PEB_DEFAULT_FONT_COLOR, PEB_DEFAULT_FONT_SIZE } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';

// TODO: Variant should be 'rounded' instead of 'button-rounded'

@Component({
  selector: 'peb-element-button',
  templateUrl: './button.element.html',
  styleUrls: ['./button.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebButtonElement extends PebAbstractElement {

  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  PebInteractionType = PebInteractionType;

  @ViewChild('textContentRef') textContentRef: ElementRef;

  @HostBinding('attr.peb-link-type')
  get attrButtonLinkType() {
    return this.isActionLink && this.element.data.action.type
      ? this.element.data.action.type
      : null;
  }

  @HostBinding('attr.peb-link-data')
  get attrButtonLinkData() {
    return this.isActionLink && this.element.data.action.payload && this.element.data.action.payload.data
      ? this.element.data.action.payload.data
      : null;
  }

  @HostListener('click')
  onClick() {
    if (!this.element.data.action) {
      return;
    }

    const { payload, type } = this.element.data.action

    const interaction =
      type === PebInteractionType.NavigateInternal
        ? PebInteractionCreator.navigate.internal(payload)
        : type === PebInteractionType.NavigateExternal
          ? PebInteractionCreator.navigate.external(payload)
          : type === PebInteractionType.CheckoutOpenAmount
            ? PebInteractionCreator.checkout.openAmount()
            : type === PebInteractionType.CheckoutOpenQr
              ? PebInteractionCreator.checkout.openQr()
              : null;

    if (!interaction) {
      console.warn('There is no interaction creator for: ', this.element.data);
      return;
    }

    this.interact(interaction);
  }

  // TODO: Create enum for button action type
  get isActionLink(): boolean {
    return this.element.data.action?.type.split('.')[0] === 'navigate';
  }

  get elements(): { [key: string]: HTMLElement } {
    return {
      host: this.nativeElement,
    };
  }

  get sanitizedText(): SafeHtml {
    let text = this.element.data.text;
    if (text === 'Amount') {
      switch(this.options?.locale) {
        case 'de':
          text = 'Betrag';
          break;
        case 'sv':
          text = 'Belopp';
          break;
      }
    }

    return this.sanitizer.bypassSecurityTrustHtml(text);
  }

  get textContent(): HTMLElement {
    return this.textContentRef.nativeElement;
  }

  // TODO: Should be somehow shared with button maker styles because it's 100% the same
  get mappedStyles(): any {
    const styles = this.styles;
    const { scale } = this.options;

    return  {
      host: {
        display: styles.display || 'inline-flex',
        position: styles.position || 'relative',
        lineHeight: styles.lineHeight ? (+styles.lineHeight * scale + 'px') : null,
        textAlign: styles.textAlign || 'center',
        textDecoration: styles.textDecoration || null,
        fontWeight: styles.fontWeight || 'normal',
        fontStyle: styles.fontStyle || null,
        fontSize: transformStyleProperty(styles.fontSize || PEB_DEFAULT_FONT_SIZE, scale),
        fontFamily: styles.fontFamily || 'Roboto',
        borderRadius: styles.borderRadius ? (+styles.borderRadius * scale + 'px' ) : null,
        color: styles.color || '#FFF',
        justifyContent: styles.justifyContent || 'center',
        alignItems: styles.alignItems || 'center',
        // Rob asked to remove temporary borders from button element
        // borderStyle: styles.borderStyle ? styles.borderStyle : null ,
        // borderColor: styles.borderColor || null,
        // borderWidth: styles.borderWidth ? (+styles.borderWidth * scale + 'px') : null,
        top: styles.top ? +styles.top + 'px' : '0px',
        left: styles.left ? +styles.left + 'px' : '0px',
        transform: styles.transform || null,
        cursor: this.options.interactions ? 'pointer' : 'normal',
        margin: styles.margin ? transformStyleProperty(styles.margin, scale) : null,
        overflow: styles.overflow || null,
        whiteSpace: styles.whiteSpace || null,
        textOverflow: styles.textOverflow || null,

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        ...('boxShadow' in styles && { boxShadow: transformStyleProperty(styles.boxShadow, scale) }),

        width: 'width' in styles ? transformStyleProperty(styles.width, scale) : 'max-content',
        height: styles.height ? transformStyleProperty(styles.height, scale) : 'max-content',

        backgroundColor: styles.backgroundColor ? styles.backgroundColor : PEB_DEFAULT_FONT_COLOR,
        backgroundImage: 'backgroundImage' in styles ? styles.backgroundImage : PEB_DEFAULT_FONT_COLOR,

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
        ...('padding' in styles && { padding: transformStyleProperty(styles.padding, scale) }),
        ...('background' in styles && { background: styles.background }),

        minWidth: '2em',
        minHeight: '1em',
      },
    };
  }
}
