import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'peb-editor-number-input-old',
  templateUrl: 'number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
})
export class PebEditorNumberInputComponent implements OnInit, OnDestroy {
  @Input() control: FormControl;
  @Input() unit: string;
  @Input() label: string;
  @Input() min: number;
  @Input() max: number;
  @Input() placeholder: string;

  @Output() changeBlur = new EventEmitter<PebEditorNumberInputComponent>();
  @Output() changeFocus = new EventEmitter<PebEditorNumberInputComponent>();

  private valueStored = null;

  ngOnInit() {
    this.valueStored = this.control.value;
    this.control.valueChanges.subscribe(
      value => {
        if (value !== null)
          this.valueStored = value;
      },
    )
  }

  ngOnDestroy() {
    this.onBlur();
  }

  onKeydown(event: KeyboardEvent) {
    // need to stop all propagation, cause different PebElement react on different keys
    // i.e. PebElementButton enters edition mode on keydown
    event.stopPropagation();
  }

  onBlur() {
    this.changeBlur.emit(this);
    let value = this.control.value;
    if (value === null) {
      value = this.valueStored;
    }

    this.control.patchValue(value);
  }

  onFocus() {
    this.changeFocus.emit(this);
  }

  increment() {
    const value = parseInt(this.control.value, 10);
    if (isNaN(this.max) || value < this.max) {
      this.control.patchValue(value + 1);
    }
  }

  decrement() {
    const value = parseInt(this.control.value, 10);
    if (isNaN(this.min) || value > this.min) {
      this.control.patchValue(value - 1);
    }
  }
}
