import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-border-form',
  templateUrl: './border.form.html',
  styleUrls: ['./border.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorBorderForm {
  @Input() formGroup: FormGroup;

  @Output() blurred = new EventEmitter<void>();

  blur() {
    this.blurred.emit();
  }

  toggleBorder(value: boolean) {
    this.formGroup.patchValue({
      borderWidth: value ? 1 : 0,
    });
    this.blur();
  }
}
