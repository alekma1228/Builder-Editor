import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fromEvent, merge } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '../../../../../misc/abstract.component';

@Component({
  selector: 'peb-editor-sidebar-angle-picker',
  templateUrl: 'angle-picker.component.html',
  styleUrls: ['./angle-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorAnglePickerComponent extends AbstractComponent implements AfterViewInit, OnInit {
  @Input() control: FormControl;

  @ViewChild('circle') circle: ElementRef;

  circleCenterX = 0;
  circleCenterY = 0;

  value = 0;

  constructor(private element: ElementRef) {
    super();
  }

  ngAfterViewInit(): void {
    this.updateValueAndRotateCircle(this.control.value);
  }

  ngOnInit(): void {
    this.control.valueChanges.pipe(
      tap(value => {
        if (this.value !== value) {
          this.updateValueAndRotateCircle(value);
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    fromEvent(this.element.nativeElement, 'mousedown').pipe(
      map(this.preventDefaultMouseEvent),
      filter((event: MouseEvent) => event.button === 0 && this.control.enabled),
      tap(() => this.calculateCircleCenter()),
      switchMap(() => fromEvent(document, 'mousemove').pipe(
        takeUntil(merge(
          fromEvent(document, 'mouseup'),
          fromEvent(document, 'click'),
        )),
      )),
      tap((event: MouseEvent) => {
        this.calculateAndUpdateAngleIfChanged(event.pageX, event.pageY);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private calculateAndUpdateAngleIfChanged(cursorPositionX: number, cursorPositionY: number) {
    const deltaX = cursorPositionX - this.circleCenterX;
    const deltaY = cursorPositionY - this.circleCenterY;

    let angle = Math.round(Math.atan2(-deltaY, deltaX) * (180 / Math.PI));
    angle = angle >= 0 ? angle : angle + 360;

    if (this.value !== angle) {
      this.updateValueAndRotateCircle(angle);
      this.control.patchValue(angle);
    }
  }

  private calculateCircleCenter() {
    const circleRect = this.circle.nativeElement.getBoundingClientRect();

    this.circleCenterX = circleRect.left + circleRect.width / 2;
    this.circleCenterY = circleRect.top + circleRect.height / 2;
  }

  private updateValueAndRotateCircle(value: number): void {
    this.value = value;
    if (this.circle) {
      this.circle.nativeElement.style.transform = 'rotate(-' + value + 'deg)';
    }
  }

  private preventDefaultMouseEvent = (mouseEvent: Event) => {
    mouseEvent.preventDefault();
    return mouseEvent;
  };
}
