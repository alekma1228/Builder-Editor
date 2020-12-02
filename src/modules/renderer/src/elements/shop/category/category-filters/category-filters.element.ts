import {
  AfterViewInit,
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
  PebElementDef,
  PebElementStyles,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';
import { PebAbstractElement } from '../../../_abstract/abstract.element';

@Component({
  selector: 'shop-category-filters',
  templateUrl: './category-filters.element.html',
  styleUrls: ['./category-filters.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopCategoryFiltersElement extends PebAbstractElement implements AfterViewInit {
  @Input() context: PebElementContext<any>;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;
  @Input() element: PebElementDef;

  @Output() toggleFilters: EventEmitter<any> = new EventEmitter();
  @Output() toggleShownFilters: EventEmitter<any> = new EventEmitter();

  PebElementContextState = PebElementContextState;

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
    };
  }

  get mappedStyles() {
    return {
      host: {
        borderColor: this.styles?.borderColor,
      },
    };
  }

  onToggleShownFilters(): void {
    if (!this.options.interactions) {
      return;
    }

    this.toggleShownFilters.emit();
  }

  // TODO: add typings
  onToggleFilter(value): void {
    if (!this.options.interactions) {
      return;
    }

    this.toggleFilters.emit(value);
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
