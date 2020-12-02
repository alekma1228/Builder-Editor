import { Component, ElementRef, HostBinding, HostListener, Input, Renderer2, ViewChild } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import {
  PebElementContext,
  PebElementDef,
  PebInteractionCreator,
  PebInteractionType,
  PebLinkDatasetLink,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
  scaleTextInnerFonts,
  transformStyleProperty,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../renderer.types';
import { PebAbstractElement } from '../_abstract/abstract.element';



@Component({
  selector: 'peb-element-text',
  templateUrl: './text.element.html',
  styleUrls: [
    '../_abstract/abstract.element.scss',
    './text.element.scss',
  ],
})
export class PebTextElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() context: PebElementContext<any>;
  @Input() options: PebRendererOptions;

  @ViewChild('textContentRef') textContentRef: ElementRef;

  // TODO: check typings MouseEvent doesn't work with ssr
  @HostListener('click', ['$event'])
  onClick(e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.options.interactions) {
      return;
    }

    const path = e.composedPath() as HTMLElement[];
    const linkNode = path.find(
      node => node.hasAttribute(PebLinkDatasetLink.type) && node.hasAttribute(PebLinkDatasetLink.payload)
    );

    if (linkNode) {
      const type = linkNode.getAttribute(PebLinkDatasetLink.type) as PebInteractionType;
      const payload = linkNode.getAttribute(PebLinkDatasetLink.payload);

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
  }

  @HostBinding('class.interactions')
  get classFrontPage(): boolean {
    return this.options.interactions;
  }

  private get rawText(): string {
    const content = this.styles?.content ?? this.element.data?.text;
    const { scale } = this.options;
    if (scale !== 1) {
      return scaleTextInnerFonts(this.injector.get(Renderer2), content, scale);
    }
    return content;
  }

  get sanitizedText(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.rawText);
  }

  get potentialContainer() {
    return this.nativeElement;
  }

  get elements() {
    return {
      host: this.nativeElement,
    };
  }

  get textContent(): HTMLElement {
    return this.textContentRef.nativeElement;
  }

  // TODO: Should be somehow shared with text maker styles because it's 100% the same
  get mappedStyles() {
    const styles = this.styles as any;
    const { scale } = this.options;

    return  {
      host: {
        position: 'relative',
        top: styles.top ? +styles.top + 'px' : '0px',
        left: styles.left ? +styles.left + 'px' : '0px',
        display: styles.display ? styles.display : 'inline-block',
        color: styles.color,
        fontSize: transformStyleProperty(styles.fontSize || PEB_DEFAULT_FONT_SIZE, scale),
        fontWeight: styles.fontWeight,
        // justifyContent: styles.justifyContent || 'center',
        transform: styles.transform || null,
        background: styles.background ? styles.background : null,
        fontFamily: styles.fontFamily || PEB_DEFAULT_FONT_FAMILY,
        boxShadow: styles.boxShadow || null,
        textShadow: styles.textShadow ? styles.textShadow : null,
        border: styles.border ? styles.border : null,
        alignItems: styles.alignItems ? styles.alignItems : null,
        flexDirection: 'column',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),

        padding: styles.padding ? transformStyleProperty(styles.padding, scale) : null,
        width: styles.width ? transformStyleProperty(styles.width, scale) : 'max-content',
        height: styles.height ? transformStyleProperty(styles.height, scale) : 'max-content',
        backgroundColor: styles.backgroundColor || null,
        overflowWrap: styles.overflowWrap || 'break-word',

        textAlign: 'textAlign' in styles ? styles.textAlign : 'left',
        ...('fontStyle' in styles && { fontStyle: styles.fontStyle }),
        ...('textDecoration' in styles && { textDecoration: styles.textDecoration }),

        ...('maxWidth' in styles && {maxWidth: transformStyleProperty(styles.maxWidth, scale)}),

        minHeight: styles.minHeight ? transformStyleProperty(styles.minHeight, scale) : 'initial',
        ...(styles.cursor ? {cursor: styles.cursor} : null),
      },
    };
  }
}
