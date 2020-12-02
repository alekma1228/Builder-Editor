import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeDataGridModule } from '@pe/data-grid';

import { PebThemesComponent } from './routes/themes/themes.component';
import { PebThemesSnackbarComponent } from './components/snackbar/snackbar.component';
import { CompanyContext } from './context-services/company.context';
import { ProductsContext } from './context-services/products.context';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const PebViewerModuleForRoot = PebViewerModule.forRoot();

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatSnackBarModule,
    PebViewerModuleForRoot,
    MatProgressSpinnerModule,
    NgScrollbarModule,
    PeDataGridModule,
  ],
  declarations: [
    PebThemesComponent,
    PebThemesSnackbarComponent,
  ],
  providers: [
    {
      provide: 'ContextServices.Company',
      useClass: CompanyContext,
    },
    {
      provide: 'ContextServices.Products',
      useClass: ProductsContext,
    },
  ],
  exports: [
    PebThemesComponent,
  ],
  entryComponents: [
    PebThemesSnackbarComponent,
  ],
})
export class PebThemesSharedModule {}
