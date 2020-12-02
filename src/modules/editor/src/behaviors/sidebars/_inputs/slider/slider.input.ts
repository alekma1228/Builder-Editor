import { Component, EventEmitter, Injector, Input, OnDestroy, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ControlValueAccessorConnector } from '../control-value-accessor.connector';

@Component({
  selector: 'peb-editor-slider-input',
  templateUrl: './slider.input.html',
  styleUrls: ['./slider.input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SidebarSliderInput,
      multi: true,
    },
  ],
})
export class SidebarSliderInput extends ControlValueAccessorConnector implements OnDestroy {
  @Input() unit: string;
  @Input() label: string;
  @Input() min: number;
  @Input() max: number;

  @Output() blurred = new EventEmitter<void>();

  private focused = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnDestroy() {
    this.blur();
  }

  focus() {
    this.focused = true;
  }

  blur() {
    if (!this.focused) {
      return;
    }

    this.focused = false;
    this.blurred.emit();
  }
}
