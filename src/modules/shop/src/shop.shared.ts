import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebShopCreateComponent } from './routes/create/shop-create.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    PebShopCreateComponent,
    AbbreviationPipe,
  ],
  exports: [
    AbbreviationPipe,
    PebShopCreateComponent,
  ],
})
export class PebShopSharedModule {}
