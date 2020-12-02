import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ControlValueAccessorConnector } from '../control-value-accessor.connector';

@Component({
  selector: 'peb-editor-text-input',
  templateUrl: './text.input.html',
  styleUrls: ['./text.input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SidebarTextInput,
      multi: true,
    },
  ],
})
export class SidebarTextInput extends ControlValueAccessorConnector {
  @Input() placeholder = '';

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  @ViewChild('input', { read: ElementRef, static: false })
  inputRef: ElementRef<HTMLInputElement>;

  constructor(injector: Injector) {
    super(injector);
  }
}
