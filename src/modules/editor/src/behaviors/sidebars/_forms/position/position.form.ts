import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-position-form',
  templateUrl: './position.form.html',
  styleUrls: ['./position.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPositionForm {
  @Input() formGroup: FormGroup;
  @Input() limits: any;

  @Output() blurred = new EventEmitter<void>();
}
