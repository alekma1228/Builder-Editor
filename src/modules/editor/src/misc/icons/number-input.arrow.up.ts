import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-number-input-arrow-up-icon',
  template: `
    <svg
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:cc="http://creativecommons.org/ns#"
      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      id="svg10"
      version="1.1"
      viewBox="0 0 15 12"
      height="12px"
      width="15px"
    >
      <defs id="defs14" />
      <title id="title2">arrow-up</title>
      <g
        fill-rule="evenodd"
        fill="none"
        stroke-width="1"
        stroke="none"
        id="Page-1"
      >
        <g
          transform="translate(7.500000, 7.000000) rotate(-180.000000) translate(-7.500000, -7.000000) translate(0.000000, 0.000000)"
          id="arrow-up"
        >
          <path
            fill="currentColor"
            id="Rectangle-Copy-101"
            d="M0,0 L15,0 L15,8 C15,11.3137085 12.3137085,14 9,14 L6,14 C2.6862915,14 4.05812251e-16,11.3137085 0,8 L0,0 L0,0 Z"
          />
          <path
            transform="translate(7.500000, 7.135005) scale(1, -1) translate(-7.500000, -7.135005) "
            [attr.fill]="arrowColor"
            id="Combined-Shape-Copy-3"
            d="M7.51542031,5 L11,8.30758933 L9.99686033,9.27001087 L7.5,6.9 L5.00313967,9.27001087 L4,8.30758933 L7.48457969,5 L7.5,5.015 L7.51542031,5 Z"
          />
        </g>
      </g>
    </svg>
  `,
})
export class PebEditorNumberInputArrowUpComponent {
  @Input() arrowColor = '#E7E7E7';
}
