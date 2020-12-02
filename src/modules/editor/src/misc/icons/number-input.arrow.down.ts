import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-number-input-arrow-down-icon',
  template: `
    <svg
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:cc="http://creativecommons.org/ns#"
      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      id="svg8"
      viewBox="0 3 15 12"
      height="12px"
      width="15px"
      version="1.1">
      <defs
        id="defs12" />
      <g
        fill-rule="evenodd"
        fill="none"
        stroke-width="1"
        stroke="none"
        id="Page-1">
        <g id="arrow-down">
          <path
            id="path2"
            d="M0 7463 c0 -2251 2 -2663 15 -2806 94 -1063 496 -2033 1186 -2862 114 -136 419 -445 559 -566 242 -207 553 -429 804 -574 569 -326 1230 -550 1877 -635 152 -20 189 -20 2010 -17 l1854 2 155 27 c227 39 423 82 610 134 713 198 1385 561 1970 1063 139 119 443 428 559 566 625 749 1025 1643 1156 2585 45 328 45 293 45 3083 l0 2637 -6400 0 -6400 0 0 -2637z m5334 -808 c582 -553 1062 -1005 1066 -1005 4 0 484 452 1066 1005 583 553 1063 1004 1068 1002 19 -6 853 -812 849 -820 -3 -4 -670 -640 -1484 -1412 -947 -900 -1486 -1405 -1499 -1405 -12 0 -554 507 -1504 1410 l-1485 1410 117 113 c239 233 736 707 742 707 3 0 482 -452 1064 -1005z" />
          <path
            fill="currentColor"
            id="Rectangle-Copy-101"
            d="M0,0 L15,0 L15,8 C15,11.3137085 12.3137085,14 9,14 L6,14 C2.6862915,14 4.05812251e-16,11.3137085 0,8 L0,0 L0,0 Z" />
          <path
            transform="translate(7.500000, 7.135005) scale(1, -1) translate(-7.500000, -7.135005) "
            [attr.fill]="arrowColor"
            id="Combined-Shape-Copy-3"
            d="M7.51542031,5 L11,8.30758933 L9.99686033,9.27001087 L7.5,6.9 L5.00313967,9.27001087 L4,8.30758933 L7.48457969,5 L7.5,5.015 L7.51542031,5 Z" />
        </g>
      </g>
    </svg>
  `,
})
export class PebEditorNumberInputArrowDownComponent {
  @Input() arrowColor = '#E7E7E7';
}
