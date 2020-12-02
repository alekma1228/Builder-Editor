import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AbstractComponent } from '../../../../../misc/abstract.component';

enum BorderStyle {
  Solid = 'solid',
  Shortdashed = 'shortdashed',
  Dashed = 'dashed',
  Longdashed = 'longdashed',
  Dotted = 'dotted',
}

@Component({
  selector: 'peb-editor-svg-border-sidebar-select',
  templateUrl: 'svg-border-select.component.html',
  styleUrls: ['./svg-border-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PebEditorSVGBorderSelectComponent),
      multi: true,
    },
  ],
})
export class PebEditorSVGBorderSelectComponent extends AbstractComponent
  implements ControlValueAccessor {
  @Input() disabled = false;

  selectedOption = BorderStyle.Solid;
  options = Object.values(BorderStyle);
  selectedBorder = '';

  onChange: any = () => {};
  onTouch: any = () => {};

  set value(val) {
    this.selectedBorder = val;
    this.onChange(val);
    this.onTouch(val);
  }

  get value() {
    return this.selectedBorder;
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  isSingleLineBorder(option: BorderStyle) {
    return [BorderStyle.Solid, BorderStyle.Dotted, BorderStyle.Dashed].includes(
      option,
    );
  }
}
