import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PebPageVariant } from '@pe/builder-core';

@Component({
  selector: 'editor-menu-routes-form',
  templateUrl: './menu-routes.form.html',
  styleUrls: ['./menu-routes.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorMenuRoutesForm implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() options: any;

  @Output() changed = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();

  onChange(): void {
    this.changed.emit();
  }

  get controls() {
    return this.routes.controls as FormGroup[];
  }

  get routes() {
    return this.formGroup.controls.routes as FormArray;
  }

  addField(index: number) {
    const fg = new FormGroup({
      title: new FormControl('Page'),
      variant: new FormControl(PebPageVariant.Default),
      value: new FormControl(null),
      newTab: new FormControl(null),
    });

    typeof index === 'number' ? this.routes.insert(index + 1, fg) : this.routes.push(fg);

    this.changed.emit();
  }

  removeField(index: number) {
    this.routes.removeAt(index);
    this.changed.emit();
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(
      tap(() => {
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
