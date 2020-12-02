import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes } from '@angular/router';
import { PortalModule } from '@angular/cdk/portal';

import { PebViewerModule } from '@pe/builder-viewer';

import { SandboxSourceEditorComponent } from './source-editor.component';
import { SandboxSourceEditorDataResolver } from './source-editor.resolver';

import { AceEditorModule } from 'ng2-ace-editor';
import { AngularSplitModule } from 'angular-split';

const routes: Routes = [
  {
    path: '',
    component: SandboxSourceEditorComponent,
  },
  {
    path: ':identifier',
    component: SandboxSourceEditorComponent,
    resolve: { data: SandboxSourceEditorDataResolver },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    PortalModule,
    MatListModule,
    PebViewerModule.forRoot(),
    AceEditorModule,
    AngularSplitModule.forRoot(),
  ],
  providers: [
    SandboxSourceEditorDataResolver,
  ],
  declarations: [
    SandboxSourceEditorComponent,
  ],
})
export class SandboxSourceEditorModule {}
