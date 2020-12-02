import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

import { PebElementDef, PebElementStyles, PebInteractionCreator } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';
import { PebRendererOptions } from '../../../renderer.types';

// TODO: should be removed
/** @deprecated menu already include mobile menu */
@Component({
  selector: 'peb-element-mobile-menu',
  templateUrl: './mobile-menu.element.html',
  styleUrls: ['./mobile-menu.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebMobileMenuElement extends PebAbstractElement {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @ViewChild('mobileMenuRef') mobileMenuRef: ElementRef;

  defaultFontSize = 11;

  static contextFetcher(ctx) {
    return { '#logo': ctx['#logo'], '@mobile-menu': ctx['@mobile-menu'] };
  }

  get menuContext() {
    return this.context ? this.context['@mobile-menu'] : null;
  }

  get logoContext() {
    return this.context ? this.context['#logo'] : null;
  }

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      mobileMenu: this.mobileMenuRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const styles = this.styles;
    const { scale } = this.options;
    return {
      host: {
        fontSize: this.defaultFontSize * scale + 'px',
      },
      mobileMenu: {
        height:
          this.menuContext?.data?.opened === true
            ? '100%'
            : '0%',
      },
    };
  }
  hideMobileMenu() {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.navigation.hideMobileMenu());
  }

  redirectTo(path: string) {
    if (!this.options.interactions) {
      return;
    }

    this.interact(PebInteractionCreator.navigate.internal(path));
  }

  getLogoUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }
}
