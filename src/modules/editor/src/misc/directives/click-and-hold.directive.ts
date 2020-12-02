import { Directive, ElementRef, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { fromEvent, interval, merge } from 'rxjs';
import { delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

import { AbstractComponent } from '../abstract.component';

const EmitDelay = 500;
const EmitInterval = 50;

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[clickAndHold]' })
export class ClickAndHoldDirective extends AbstractComponent implements OnInit {

  @Output() clickAndHold = new EventEmitter<void>();

  constructor(
    @Inject(DOCUMENT) private document: any,
    private element: ElementRef,
  ) {
    super();
  }

  ngOnInit() {
    fromEvent(this.element.nativeElement, 'mousedown').pipe(
      switchMap(() => interval(EmitInterval).pipe(
        delay(EmitDelay),
        takeUntil(merge(
          fromEvent(this.element.nativeElement, 'mouseleave'),
          fromEvent(this.document, 'mouseup'),
          fromEvent(this.document, 'click'),
        )),
      )),
      tap(() => this.clickAndHold.emit()),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
