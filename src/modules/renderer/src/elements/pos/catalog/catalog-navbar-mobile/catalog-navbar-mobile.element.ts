import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  PebElementStyles,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';

@Component({
  selector: 'pos-catalog-navbar-mobile',
  templateUrl: './catalog-navbar-mobile.element.html',
  styleUrls: ['./catalog-navbar-mobile.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPosCatalogNavbarMobileElement {
  @Input() context: PebElementContext<any>;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @Output() toggleFilters: EventEmitter<any> = new EventEmitter();
  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Output() resetFilters: EventEmitter<void> = new EventEmitter();
  @Output() toggleProductsDisplay: EventEmitter<void> = new EventEmitter();
  @Output() searchProducts: EventEmitter<string> = new EventEmitter();

  @ViewChild('imageRef') imageRef: ElementRef;

  PebElementContextState = PebElementContextState;

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

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }
}
