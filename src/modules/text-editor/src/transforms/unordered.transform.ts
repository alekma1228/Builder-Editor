// import { Inject, Injectable } from '@angular/core';
// import { DOCUMENT } from '@angular/common';

// import { ExecCommand, Transform } from '../text.interface';
// import { BaseTransform } from './base.transform';

// // @Injectable({ providedIn: 'any' })
// export class UnorderedTransform extends BaseTransform implements Transform {

//   constructor(
//     @Inject(DOCUMENT) document: Document,
//   ) {
//     super(document);
//   }

//   change(currentValue: string) {
//     if (this.value) {
//       return this.removeTransformList(currentValue);
//     }

//     this.execCommand(ExecCommand.InsertUnorderedList);
//   }

//   get value(): boolean {
//     return document.queryCommandState(ExecCommand.InsertUnorderedList);
//   }

//   /**
//    * Remove unordered list needs to be manually (issue on return to the previous value).
//    *
//    * @param currentValue Current text widget value.
//    */
//   private removeTransformList(currentValue: string): string {
//     if (!currentValue) {
//       return currentValue;
//     }

//     const ulList = currentValue.indexOf('<ul>');
//     const ulListClosed = currentValue.indexOf('</ul>');
//     const listContent = currentValue.slice(ulList + 4, ulListClosed);

//     const newListContent = listContent.replace(/<li>/g, '').replace(/<\/li>/g, '<br>');

//     const firstPart = currentValue.split('<ul>');
//     const secondPart = currentValue.split('</ul>');

//     return firstPart[0].concat(newListContent).concat(secondPart[1]);
//   }
// }
