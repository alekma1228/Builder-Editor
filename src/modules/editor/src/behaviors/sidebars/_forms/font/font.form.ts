import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AbstractComponent } from '../../../../misc/abstract.component';

@Component({
  selector: 'editor-font-form',
  templateUrl: './font.form.html',
  styleUrls: ['./font.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFontForm  extends AbstractComponent {
  @Input() formGroup: FormGroup;
  @Input() options: any;
  @Input() title = 'Font'

  @Output() blurred = new EventEmitter<void>();

  blur() {
    this.blurred.emit();
  }

  get bold() {
    return this.formGroup.value.fontWeight === 'bold';
  }

  get italic() {
    return this.formGroup.value.fontStyle === 'italic';
  }

  get underline() {
    return this.formGroup.value.textDecoration?.split(' ').find((s: string) => s === 'underline');
  }

  get lineThrough() {
    return this.formGroup.value.textDecoration?.split(' ').find((s: string) => s === 'line-through');
  }

  toggleBold() {
    this.formGroup.patchValue({ fontWeight: this.bold ? 'normal' : 'bold' });
    this.blur();
  }

  toggleItalic() {
    this.formGroup.patchValue({ fontStyle: this.italic ? 'normal' : 'italic' });
    this.blur();
  }

  toggleUnderline() {
    this.formGroup.patchValue({
      textDecoration: this.underline
        ? this.formGroup.value.textDecoration?.split(' ').filter((s: string) => s !== 'underline').join(' ')
        : [
          ...(this.formGroup.value.textDecoration ? this.formGroup.value.textDecoration?.split(' ') : []),
          'underline',
        ].join(' '),
    });
    this.blur();
  }

  toggleLineThrough() {
    this.formGroup.patchValue({
      textDecoration: this.lineThrough
        ? this.formGroup.value.textDecoration?.split(' ').filter((s: string) => s !== 'line-through').join(' ')
        : [
          ...(this.formGroup.value.textDecoration ? this.formGroup.value.textDecoration?.split(' ') : []),
          'line-through',
        ].join(' '),
    });
    this.blur();
  }
}
