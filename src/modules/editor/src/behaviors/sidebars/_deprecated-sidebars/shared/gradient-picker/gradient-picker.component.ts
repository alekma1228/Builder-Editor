import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '../../../../../misc/abstract.component';
import { AngleFlipHelper } from '../helpers/angle-flip.helper';

@Component({
  selector: 'peb-editor-gradient-picker',
  templateUrl: './gradient-picker.component.html',
  styleUrls: ['./gradient-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorGradientPickerComponent extends AbstractComponent
  implements OnInit {
  @Input() control: FormControl;

  formGroup = new FormGroup({
    firstGradientColor: new FormControl(''),
    secondGradientColor: new FormControl(''),
    angle: new FormControl(0),
  });

  get firstGradientColor() {
    return this.formGroup.get('firstGradientColor');
  }

  get secondGradientColor() {
    return this.formGroup.get('secondGradientColor');
  }

  get angle() {
    return this.formGroup.get('angle');
  }

  constructor(private angleFlipHelper: AngleFlipHelper) {
    super();
  }

  ngOnInit(): void {
    const gradientValues = (this.control.value || '')
      .replace(/(^.*\(|\).*$)/g, '')
      .split(',');

    if (!gradientValues.length) return;

    const [angle, firstGradientColor, secondGradientColor] = gradientValues;
    this.formGroup.patchValue({
      firstGradientColor,
      secondGradientColor,
      angle: parseInt(angle, 10),
    });
    this.updateControl();
  }

  updateControl() {
    this.formGroup.valueChanges
      .pipe(
        tap(({ angle, secondGradientColor, firstGradientColor }) => {
          this.control.patchValue(
            `linear-gradient(${angle || 0}deg,${secondGradientColor || ''},${
              firstGradientColor || ''
            })`,
          );
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  flipV(): void {
    const angle = this.angle.value;
    const newAngle = this.angleFlipHelper.flipV(angle);
    this.angle.patchValue(newAngle);
  }

  flipH(): void {
    const angle = this.angle.value;
    const newAngle = this.angleFlipHelper.flipH(angle);
    this.angle.patchValue(newAngle);
  }
}
