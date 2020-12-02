import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-proportions-form',
  templateUrl: './proportions.form.html',
  styleUrls: ['./proportions.form.scss'],
})
export class EditorProportionsForm implements AfterViewInit {
  @Input() formGroup: FormGroup;

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  proportionsModel: boolean;

  ngAfterViewInit() {
    this.proportionsModel = this.formGroup.value.objectFit === 'contain';
  }

  onChangeProportionsModel(proportionsSave: boolean) {
    this.formGroup.patchValue({ objectFit: proportionsSave ? 'contain': 'inherit' });
    this.blurred.emit();
  }
}
