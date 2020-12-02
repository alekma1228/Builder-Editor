import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

import {
  PebElementContext,
  PebElementContextState,
  PebElementStyles,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';

@Component({
  selector: 'pos-catalog-filters',
  templateUrl: './catalog-filters.element.html',
  styleUrls: ['./catalog-filters.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPosCatalogFiltersElement {
  @Input() context: PebElementContext<any>;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;

  @Output() toggleFilters: EventEmitter<void> = new EventEmitter();
  @Output() toggleFilter: EventEmitter<any> = new EventEmitter();

  PebElementContextState = PebElementContextState;

  onToggleShownFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.toggleFilters.emit();
  }

  // TODO: add typings
  onToggleFilter(value): void {
    if (!this.options.interactions) {
      return;
    }

    this.toggleFilter.emit(value);
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }
}
