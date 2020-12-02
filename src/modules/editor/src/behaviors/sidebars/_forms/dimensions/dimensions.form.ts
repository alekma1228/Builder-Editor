import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-dimensions-form',
  templateUrl: './dimensions.form.html',
  styleUrls: ['./dimensions.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDimensionsForm {
  @Input() formGroup: FormGroup;
  @Input() limits: any;

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();
}
