import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { isArray } from 'lodash';

import {
  PebElementContext,
  PebElementContextState,
  PebElementDef,
  PebElementStyles,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';
import { PebAbstractElement } from '../../../_abstract/abstract.element';

@Component({
  selector: 'shop-category-navbar-mobile',
  templateUrl: './category-navbar-mobile.element.html',
  styleUrls: ['./category-navbar-mobile.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopCategoryNavbarMobileElement extends PebAbstractElement implements AfterViewInit {
  @Input() context: PebElementContext<any>;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;
  @Input() element: PebElementDef;

  @Output() toggleFilters: EventEmitter<any> = new EventEmitter();
  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Output() resetFilters: EventEmitter<void> = new EventEmitter();
  @Output() toggleProductsDisplay: EventEmitter<void> = new EventEmitter();
  @Output() searchProducts: EventEmitter<string> = new EventEmitter();

  @ViewChild('imageRef') imageRef: ElementRef;

  PebElementContextState = PebElementContextState;
  defaultFontSize = 13;

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
    };
  }

  get mappedStyles() {
    return {
      host: {
        borderColor: this.styles?.borderColor,
        fontSize: this.defaultFontSize * this.options.scale + 'px',
      },
    };
  }

  onToggleShownFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.toggleFilters.emit();
  }

  onSort(): void {
    if (!this.options.interactions) {
      return;
    }

    this.sort.emit(null);
  }

  onResetFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.resetFilters.emit();
  }

  changeProductsDisplayMode() {
    if (!this.options.interactions) {
      return;
    }

    this.toggleProductsDisplay.emit();
  }

  onSearch(value: string): void {
    if (!this.options.interactions) {
      return;
    }

    this.searchProducts.emit(value);
  }

  get atLeastOneFilterActive(): boolean {
    return this.context?.data?.filters.some(parentFilter =>
      parentFilter.children.some(filter => filter.active),
    );
  }

  // TODO: return after checking renderer's styling.
  ngAfterViewInit() {
    this.applyStyles();
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }
}
