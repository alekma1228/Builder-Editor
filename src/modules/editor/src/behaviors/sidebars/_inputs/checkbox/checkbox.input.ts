import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ControlValueAccessorConnector } from '../control-value-accessor.connector';

@Component({
  selector: 'peb-editor-checkbox-input',
  templateUrl: './checkbox.input.html',
  styleUrls: ['./checkbox.input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SidebarCheckboxInput,
      multi: true,
    },
  ],
})
export class SidebarCheckboxInput extends ControlValueAccessorConnector {
  @Input() placeholder = '';
  @Input() label = '';

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  @ViewChild('input', { read: ElementRef, static: false })
  inputRef: ElementRef<HTMLInputElement>;

  constructor(injector: Injector) {
    super(injector);
  }
}
