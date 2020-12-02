import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { PebRendererModule } from '@pe/builder-renderer';
import { PebViewerModule } from '@pe/builder-viewer';
import { ProductsContext, CompanyContext } from '@pe/builder-editor';

import { SandboxViewerComponent } from './viewer.component';
import { SandboxViewerDataResolver } from './viewer.resolver';

const routes: Routes = [
  {
    path: ':type/:identifier',
    component: SandboxViewerComponent,
    resolve: { data: SandboxViewerDataResolver },
  },
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forChild(routes),
    PebRendererModule,
    PebViewerModule.forRoot(),
  ],
  providers: [
    SandboxViewerDataResolver,
    {
      // TODO: For prod build
      provide: 'ContextServices.Products',
      useClass: ProductsContext,
    },
    {
      // TODO: For prod build
      provide: 'ContextServices.Company',
      useClass: CompanyContext,
    },
  ],
  declarations: [
    SandboxViewerComponent,
  ],
})
export class SandboxViewerModule {

}
