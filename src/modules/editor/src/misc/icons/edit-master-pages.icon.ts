import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-edit-master-pages-icon',
  template: `
  <svg width="31px" height="28px" viewBox="0 0 31 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <rect id="path-1" x="0" y="0" width="29" height="26" rx="2"></rect>
        <filter x="-5.2%" y="-5.8%" width="110.3%" height="111.5%" filterUnits="objectBoundingBox" id="filter-2">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="View-1" transform="translate(-34.000000, -210.000000)">
            <g id="Edit" transform="translate(35.000000, 211.000000)">
                <g id="Rectangle-Copy-21">
                    <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                    <use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-1"></use>
                </g>
                <line x1="8.5" y1="0.5" x2="8.5" y2="25.5" id="Line-14" stroke="#B7B7B7" stroke-linecap="square"></line>
                <line x1="20.5" y1="0.5" x2="20.5" y2="25.5" id="Line-14-Copy" stroke="#B7B7B7" stroke-linecap="square"></line>
                <line x1="28.5" y1="6.5" x2="0.5" y2="6.5" id="Line-14" stroke="#B7B7B7" stroke-linecap="square"></line>
                <line x1="28.5" y1="19.5" x2="0.5" y2="19.5" id="Line-14-Copy-2" stroke="#B7B7B7" stroke-linecap="square"></line>
            </g>
        </g>
    </g>
</svg>
  `,
})
export class PebEditorEditMasterPagesComponent {
}
