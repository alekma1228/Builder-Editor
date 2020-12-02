import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeDataGridModule } from '@pe/data-grid';
import { PePlatformHeaderModule } from '@pe/platform-header';

import { PebMediaComponent } from './media.component';



@NgModule({
  declarations: [PebMediaComponent],
  imports: [
    CommonModule,
    PeDataGridModule,
    PePlatformHeaderModule,
  ],
  exports: [
    PeDataGridModule,
  ],
})
export class PebMediaModule { }
