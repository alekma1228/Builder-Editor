import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-proportion-dimensions-form',
  templateUrl: './proportion-dimensions.form.html',
  styleUrls: ['./proportion-dimensions.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorProportionDimensionsForm {
  @Input() formGroup: FormGroup;
  @Input() limits: any;

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();
}
