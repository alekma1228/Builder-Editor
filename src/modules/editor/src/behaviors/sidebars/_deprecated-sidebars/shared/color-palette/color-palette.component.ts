import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'peb-editor-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorColorPaletteComponent {
  @Input() gridColors: string[];
  @Input() control: FormControl;
  @Output() colorSelected = new EventEmitter<string>();

  onColorSelect(color: string) {
    this.control?.patchValue(color);
    this.colorSelected.emit(color);
  }
}
