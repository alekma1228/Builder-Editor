import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '../../../../../misc/abstract.component';

enum BorderStyle {
  Solid = 'solid',
  Dotted = 'dotted',
  Dashed = 'dashed',
  Double = 'double',
  Groove = 'groove',
  Ridge = 'ridge',
}

@Component({
  selector: 'peb-editor-border-sidebar-select',
  templateUrl: 'border-select.component.html',
  styleUrls: ['./border-select.component.scss'],
})
export class PebEditorBorderSelectComponent extends AbstractComponent implements OnInit {
  @Input() disabled = false;
  @Input() control: FormControl;

  selectedOption = BorderStyle.Solid;
  options = Object.values(BorderStyle);

  ngOnInit(): void {
    if (this.control) {
      this.updateSelectedOption(this.control.value);
      this.control.valueChanges.pipe(
        tap(value => {
          this.updateSelectedOption(value);
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  isSingleLineBorder(option: BorderStyle) {
    return [BorderStyle.Solid, BorderStyle.Dotted, BorderStyle.Dashed].includes(option);
  }

  private updateSelectedOption(value: BorderStyle) {
    if (this.selectedOption !== value && this.options.includes(value)) {
      this.selectedOption = value;
    }
  }
}
