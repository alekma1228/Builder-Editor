import { Component } from '@angular/core';

@Component({
  selector: 'peb-icon-default-product',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="178"
      height="148"
      viewBox="0 0 178 148"
    >
      <defs>
        <path id="prefix__a" d="M0 0.001L178 0.001 178 146.553 0 146.553z" />
      </defs>
      <g fill="none" fill-rule="evenodd" opacity=".053">
        <path
          fill="#111115"
          d="M108.324 23.734c8.404 0 15.219 6.81 15.219 15.215 0 8.404-6.815 15.215-15.219 15.215-8.4 0-15.215-6.81-15.215-15.215 0-8.404 6.815-15.215 15.215-15.215"
        />
        <g transform="translate(0 .678)">
          <mask id="prefix__b" fill="#fff">
            <use xlink:href="#prefix__a" />
          </mask>
          <path
            fill="#111115"
            d="M21.19 4.239h135.62c9.361 0 16.952 7.59 16.952 16.952v99.596l-32.549-32.549c-3.84-3.874-10.095-3.903-13.964-.064l-.064.064-11.104 11.061c-3.86 3.883-10.141 3.904-14.023.047l-.047-.047-29.667-29.666c-3.86-3.887-10.137-3.908-14.024-.047l-.046.047-54.036 53.612V21.107c.047-9.333 7.624-16.868 16.952-16.868M156.81 0H21.19C9.49 0 0 9.486 0 21.19v104.173c0 11.701 9.49 21.19 21.19 21.19h135.62c11.705 0 21.19-9.489 21.19-21.19V21.107C177.953 9.435 168.481 0 156.81 0"
            mask="url(#prefix__b)"
          />
        </g>
      </g>
    </svg>
  `,
})
export class PebDefaultProductIcon {}
