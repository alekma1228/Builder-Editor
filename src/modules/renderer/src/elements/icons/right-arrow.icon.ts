import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'peb-renderer-right-arrow-icon',
  styles: [`
    :host {
      width: 9px;
      height: 16px;
      display: flex;
    }
    polyline {
      stroke: #fff;
      transition: stroke 0.5s;
    }
  `],
  template: `
    <svg width="100%" height="100%" viewBox="0 0 9 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <polyline id="Right" stroke-width="1.5"
                  transform="translate(4.500000, 8.000000) rotate(90.000000) translate(-4.500000, -8.000000) "
                  points="-3 11 4.5 5 12 11"></polyline>
      </g>
    </svg>
  `,
})
export class PebRightArrowIcon {
  constructor(public elementRef: ElementRef) { }
}
