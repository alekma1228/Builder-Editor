import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

// WIP
@Component({
  selector: 'editor-shadow-form',
  templateUrl: './shadow.form.html',
  styleUrls: ['./shadow.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorShadowForm {
  @Input() formGroup: FormGroup;

  @Output() blurred = new EventEmitter<void>();

  blur() {
    this.blurred.emit();
  }


}
