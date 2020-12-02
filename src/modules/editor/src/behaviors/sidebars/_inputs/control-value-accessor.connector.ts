import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective } from '@angular/forms';
import { Injector, Input, ViewChild } from '@angular/core';

export class ControlValueAccessorConnector implements ControlValueAccessor {
  @ViewChild(FormControlDirective, { static: true })
  formControlDirective: FormControlDirective;

  @Input()
  formControl: FormControl;

  @Input()
  formControlName: string;

  @Input('value')
  set value(val: any) {
    this.control.patchValue(val)
  }

  constructor(protected injector: Injector) {}

  get control() {
    return this.formControl || this.controlContainer.control.get(this.formControlName);
  }

  get controlContainer() {
    return this.injector.get(ControlContainer);
  }

  registerOnTouched(fn: any) {
    this.formControlDirective.valueAccessor.registerOnTouched(fn);
  }

  registerOnChange(fn: any) {
    this.formControlDirective.valueAccessor.registerOnChange(fn);
  }

  writeValue(obj: any) {
    this.formControlDirective.valueAccessor.writeValue(obj);
  }

  setDisabledState(isDisabled: boolean) {
    this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
  }
}
