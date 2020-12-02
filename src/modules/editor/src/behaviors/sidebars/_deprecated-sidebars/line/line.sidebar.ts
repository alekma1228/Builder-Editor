import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebElementDef, PebElementStyles } from '@pe/builder-core';

import { AbstractComponent } from '../../../../misc/abstract.component';
import { FillOptions } from '../cart/cart.sidebar';
import { fillOptions } from './line.constant';

interface PebElementLineAllStyles extends PebElementStyles {
  backgroundColor: string;
  height: string;
  shadowBlur: string;
  shadowOffset: string;
  shadowOpacity: string;
  shadowColor: string;
  opacity: string;
  shadowAngle: string;
  left: string;
  top: string;
  width: string;
  rotate: string;
  shadowing: number;
  stroking: number;
}

type PebElementLineStyles = Partial<PebElementLineAllStyles>;

const PREDEFINED_CONFIGS = [10, 20, 40, 60, 80, 100].map(opacity => ({ opacity }));

@Component({
  selector: 'peb-editor-line-sidebar',
  templateUrl: 'line.sidebar.html',
  styleUrls: [
    './line.sidebar.scss',
    '../sidebars.scss',
  ],
})
export class PebEditorLineSidebarComponent extends AbstractComponent implements OnInit {
  @Input() element: PebElementDef;

  @Input() styles: PebElementLineStyles;

  @Output() changeStroking = new EventEmitter<void>();
  @Output() changeShadowing = new EventEmitter<void>();
  @Output() changeStyle = new EventEmitter<PebElementLineStyles>();

  predefinedConfigs = PREDEFINED_CONFIGS;

  lineForm: FormGroup = this.formBuilder.group({
    stroking: [null],
    strokeStyle: [null],
    strokeColor: [null],
    strokeWidth: [null],
    shadowing: [null],
    shadowBlur: [null],
    shadowOffset: [null],
    shadowOpacity: [null],
    shadowAngle: [null],
    shadowColor: [null],
    opacity: [0],
    size: new FormGroup({
      width: new FormControl(null)
    }),
    position: new FormGroup({
      posX: new FormControl(null),
      posY: new FormControl(null)
    }),
    angle: [null],
    backgroundFill: new FormControl(FillOptions.ColorFill),
  });

  readonly fillOptions = fillOptions;

  constructor(private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.setInitialFormValue();
    this.trackFormChanges();
  }

  setInitialFormValue() {
    this.lineForm.patchValue({
      stroking: Boolean(this.styles.stroking),
      strokeColor: this.styles.backgroundColor,
      strokeWidth: this.styles.height,
      shadowing: Boolean(this.styles.shadowing),
      shadowBlur: this.styles.shadowBlur,
      shadowOffset: this.styles.shadowOffset,
      shadowOpacity: this.styles.shadowOpacity,
      shadowColor: this.styles.shadowColor,
      opacity: this.styles.opacity,
      position: {
        posX: this.styles.left,
        posY: this.styles.top,
      },
      size: {
        width: this.styles.width
      },
      angle: this.styles.rotate
    });
    this.lineForm.get('shadowAngle').patchValue(this.styles.shadowAngle);
  }

  trackFormChanges() {
    merge(
      this.lineForm.get('stroking').valueChanges.pipe(
        tap((value: boolean) => this.changeStroking.emit())
      ),
      this.lineForm.get('strokeColor').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ backgroundColor: value }))
      ),
      this.lineForm.get('strokeWidth').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ height: value }))
      ),
      this.lineForm.get('shadowing').valueChanges.pipe(
        tap((value: boolean) => this.changeShadowing.emit())
      ),
      this.lineForm.get('shadowBlur').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ shadowBlur: value }))
      ),
      this.lineForm.get('shadowOffset').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ shadowOffset: value }))
      ),
      this.lineForm.get('shadowOpacity').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ shadowOpacity: value }))
      ),
      this.lineForm.get('shadowColor').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ shadowColor: value }))
      ),
      this.lineForm.get('opacity').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ opacity: value }))
      ),
      this.lineForm.get('shadowAngle').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ shadowAngle: value }))
      ),
      this.lineForm.get('position').get('posX').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ left: value }))
      ),
      this.lineForm.get('position').get('posY').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ top: value }))
      ),
      this.lineForm.get('size').get('width').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ width: value }))
      ),
      this.lineForm.get('angle').valueChanges.pipe(
        tap((value: string) => this.changeStyle.emit({ rotate: value }))
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  setStrokeColor(strokeColor: string) {
    this.lineForm.patchValue({ strokeColor });
  }

  setShadowColor(shadowColor: string) {
    this.lineForm.patchValue({ shadowColor });
  }

  selectConfig(config: any) {
    this.lineForm.get('opacity').patchValue(config.opacity);
  }

  flipV() {
    const normalizedAngle = this.normalizeAngle(this.lineForm.get('angle').value);
    let newAngle;
    if (normalizedAngle < 90) { // 1 quarter
      newAngle = (normalizedAngle * (Math.PI / 180) + 1.5 * Math.PI) * 180 / Math.PI;
    } else if (normalizedAngle > 90 && normalizedAngle < 180) { // 2 quarter
      newAngle = (normalizedAngle * (Math.PI / 180) + 0.5 * Math.PI) * 180 / Math.PI;
    } else if (normalizedAngle > 180 && normalizedAngle < 270) { // 3 quarter
      newAngle = (normalizedAngle * (Math.PI / 180) - 0.5 * Math.PI) * 180 / Math.PI;
    } else if (normalizedAngle > 270 && normalizedAngle < 360) { // 4 quarter
      newAngle = (normalizedAngle * (Math.PI / 180) - 1.5 * Math.PI) * 180 / Math.PI;
    } else if (normalizedAngle === 90) {
      newAngle = 270;
    } else if (normalizedAngle === 270) {
      newAngle = 90;
    } else {
      newAngle = normalizedAngle;
    }
    this.lineForm.get('angle').patchValue(newAngle.toFixed(0));
  }

  flipH() {
    const normalizedAngle = this.normalizeAngle(this.lineForm.get('angle').value);
    let newAngle;
    if (normalizedAngle < 90 || (normalizedAngle > 180 && normalizedAngle < 270)) { // 1, 3 quarter
      newAngle = (normalizedAngle * (Math.PI / 180) + 0.5 * Math.PI) * 180 / Math.PI;
    } else if ((normalizedAngle > 90 && normalizedAngle < 180) || (normalizedAngle > 270 && normalizedAngle < 360)) { // 2, 4quarter
      newAngle = (normalizedAngle * (Math.PI / 180) - 0.5 * Math.PI) * 180 / Math.PI;
    } else if (normalizedAngle === 180) {
      newAngle = 0;
    } else if (normalizedAngle === 0) {
      newAngle = 180;
    } else {
      newAngle = normalizedAngle;
    }
    this.lineForm.get('angle').patchValue(newAngle.toFixed(0));
  }

  private normalizeAngle(angle: number) {
    return (angle % 360 + 360) % 360;
  }
}
