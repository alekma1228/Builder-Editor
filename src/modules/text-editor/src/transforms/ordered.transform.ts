// import { Inject, Injectable } from '@angular/core';
// import { DOCUMENT } from '@angular/common';

// import { ExecCommand, Transform } from '../text.interface';
// import { BaseTransform } from './base.transform';

// // @Injectable({ providedIn: 'any' })
// export class OrderedTransform extends BaseTransform implements Transform {

//   constructor(
//     @Inject(DOCUMENT) document: Document,
//   ) {
//     super(document);
//   }

//   change(currentValue: string): string | void {
//     if (this.value) {
//       return this.removeTransformList(currentValue);
//     }

//     this.execCommand(ExecCommand.InsertOrderedList);
//   }

//   get value(): boolean {
//     return document.queryCommandState(ExecCommand.InsertOrderedList);
//   }

//   /**
//    * Remove ordered list needs to be manually (issue on return to the previous value).
//    *
//    * @param currentValue Current text widget value.
//    */
//   private removeTransformList(currentValue: string): string {
//     if (!currentValue) {
//       return currentValue;
//     }

//     const olList = currentValue.indexOf('<ol>');
//     const olListClosed = currentValue.indexOf('</ol>');
//     const listContent = currentValue.slice(olList + 4, olListClosed);

//     const newListContent = listContent.replace(/<li>/g, '').replace(/<\/li>/g, '<br>');

//     const firstPart = currentValue.split('<ol>');
//     const secondPart = currentValue.split('</ol>');

//     return firstPart[0].concat(newListContent).concat(secondPart[1]);
//   }
// }
