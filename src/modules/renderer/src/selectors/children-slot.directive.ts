import { Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[pebRendererChildrenSlot]',
})
export class PebRendererChildrenSlotDirective {
  @Input('pebRendererChildrenSlot')
  name = '';

  constructor(
    public viewRef: ViewContainerRef,
  ) {}
}
