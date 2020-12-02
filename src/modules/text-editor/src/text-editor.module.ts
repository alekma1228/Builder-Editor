import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebTextEditor } from './text-editor.component';

@NgModule({
  declarations: [
    PebTextEditor,
  ],
  imports: [
    CommonModule,
  ],
  providers: [],
  exports: [
    PebTextEditor,
  ],
})
export class PebTextEditorModule {
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: PebTextEditorModule,
  //     providers,
  //   };
  // }
}

