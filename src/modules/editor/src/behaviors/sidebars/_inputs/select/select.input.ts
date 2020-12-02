import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ControlValueAccessorConnector } from '../control-value-accessor.connector';

export interface SidebarSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'peb-editor-select-input',
  templateUrl: './select.input.html',
  styleUrls: ['./select.input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SidebarSelectInput,
      multi: true,
    },
  ],
})
export class SidebarSelectInput extends ControlValueAccessorConnector {
  @Input() options: SidebarSelectOption[] = [];

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  @ViewChild('input', { read: ElementRef, static: false })
  inputRef: ElementRef<HTMLInputElement>;

  constructor(injector: Injector) {
    super(injector);
  }
}
