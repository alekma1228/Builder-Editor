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
  selector: 'pos-catalog-navbar',
  templateUrl: './catalog-navbar.element.html',
  styleUrls: ['./catalog-navbar.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPosCatalogNavbarElement {
  @Input() context: PebElementContext<any>;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @Output() toggleFilters: EventEmitter<void> = new EventEmitter();
  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Output() resetFilters: EventEmitter<void> = new EventEmitter();

  @ViewChild('imageRef') imageRef: ElementRef;

  PebElementContextState = PebElementContextState;

  onToggleShownFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.toggleFilters.emit();
  }

  // TODO: add typings
  onSort(value): void {
    if (!this.options.interactions) {
      return;
    }

    this.sort.emit(value);
  }

  onResetFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.resetFilters.emit();
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
