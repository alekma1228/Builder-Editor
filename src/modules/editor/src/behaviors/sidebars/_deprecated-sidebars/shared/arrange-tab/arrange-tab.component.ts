import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '../../../../../misc/abstract.component';
import { PebEditorNumberInputComponent } from '../number-input/number-input.component';

@Component({
  selector: 'peb-editor-arrange-tab',
  templateUrl: './arrange-tab.component.html',
  styleUrls: ['./arrange-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorArrangeTabComponent extends AbstractComponent implements OnInit {

  @Input() form: FormGroup;

  @Input() minWidth: number;
  @Input() minHeight: number;
  @Input() maxWidth: number;
  @Input() maxHeight: number;

  /** @deprecated */
  @Input() withResizeConstraints = true;

  /** @deprecated */
  @Input() withRotation = true;

  /** @deprecated */
  @Input() withLocking = true;


  // @Output() flipVertical: EventEmitter<void> = new EventEmitter<void>();
  // @Output() flipHorizontal: EventEmitter<void> = new EventEmitter<void>();
  @Output() lockElement: EventEmitter<void> = new EventEmitter<void>();
  @Output() unlockElement: EventEmitter<void> = new EventEmitter<void>();

  @Output() changeFocus = new EventEmitter<PebEditorNumberInputComponent>();
  @Output() changeBlur = new EventEmitter<PebEditorNumberInputComponent>();

  constrainProportions = false;
  proportionRatio = 1;

  get sizeFormGroup(): FormGroup {
    return this.form.get('size') as FormGroup;
  }

  get positionFormGroup(): FormGroup {
    return this.form.get('position') as FormGroup;
  }

  onElementFocus(element: PebEditorNumberInputComponent) {
    this.changeFocus.emit(element);
  }

  onElementBlur(element: PebEditorNumberInputComponent) {
    this.changeBlur.emit(element);
  }

  ngOnInit(): void {
    this.sizeFormGroup.get('width')?.valueChanges.pipe(
      tap(width => {
        if (this.constrainProportions) {
          const height = Math.round(width / this.proportionRatio);
          if (height !== this.sizeFormGroup.get('height').value) {
            this.sizeFormGroup.patchValue({ height });
          }
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.sizeFormGroup.get('height')?.valueChanges.pipe(
      tap(height => {
        if (this.constrainProportions) {
          const width = Math.round(height * this.proportionRatio);
          if (width !== this.sizeFormGroup.get('width').value) {
            this.sizeFormGroup.patchValue({ width });
          }
        }

      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  constrainProportionsChanged() {
    if (this.constrainProportions) {
      this.proportionRatio = this.sizeFormGroup.get('width').value / this.sizeFormGroup.get('height').value;
    }
  }

  lockElem() {
    this.form.disable();
    this.lockElement.emit();
  }

  unlockElem() {
    this.form.enable();
    this.unlockElement.emit();
  }
}
