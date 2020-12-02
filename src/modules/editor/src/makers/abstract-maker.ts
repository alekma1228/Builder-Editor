import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
} from '@angular/core';
import { isArray } from 'lodash';
import { BehaviorSubject, Subject } from 'rxjs';



import { PebElementContext, PebElementDef, PebElementStyles } from '@pe/builder-core';
import { PebRendererOptions } from '@pe/builder-renderer';

@Component({
  selector: 'peb-element-maker-abstract',
  template: '',
})
export abstract class PebAbstractMaker implements OnDestroy, AfterViewInit {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() context: PebElementContext<any>;
  @Input() options: PebRendererOptions;

  @Output() changeElement = new EventEmitter<any>();
  @Output() changeStyle = new EventEmitter<any>();
  @Output() changeElementFinal = new EventEmitter<any>();
  @Output() changeStyleFinal = new EventEmitter<any>();

  childSlots: QueryList<any>;

  limits: {
    width: number,
    height: number,
  };

  destroyed$: Subject<boolean> = new Subject<boolean>();

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    this.applyStyles();
  }

  protected constructor(
    private abstractElementRef: ElementRef,
    private abstractRenderer: Renderer2,
  ) {}

  get nativeElement() {
    return this.abstractElementRef.nativeElement;
  }

  protected abstract get elements(): { [key: string]: HTMLElement | HTMLElement[]};

  protected abstract get mappedStyles(): any;

  applyStyles() {
    if (this.elements) {
      Object.entries(this.elements).forEach(([name, element]) => {
        if (element) {
          const elementStyles =
            this.mappedStyles
            && this.mappedStyles[name]
              ? this.mappedStyles[name]
              : {};

          const elementsArr = isArray(element) ? element : [element];
          elementsArr.forEach(elem => Object.entries(elementStyles).forEach(
            ([prop, value]) => this.abstractRenderer.setStyle(elem, prop, value),
          ));
        }
      });
    }
  }

}
