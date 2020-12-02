import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes } from '@angular/router';
import { PortalModule } from '@angular/cdk/portal';

import { PebEditorModule } from '@pe/builder-editor';

import { SandboxEditorCreateShopDialog } from './dialogs/create-shop/create-shop.dialog';
import { SandboxEditorRootComponent } from './root.component';
import { SandboxCreateShopGuard } from './shop.guard';
import { SandboxShopResolver } from './shop.resolver';

const routes: Routes = [
  {
    path: '',
    canActivate: [SandboxCreateShopGuard],
    resolve: {
      shop: SandboxShopResolver,
    },
    component: SandboxEditorRootComponent,
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
    PebEditorModule.forRoot({}),
    PortalModule,
    MatListModule,
  ],
  providers: [
    SandboxCreateShopGuard,
    SandboxShopResolver,
  ],
  declarations: [
    SandboxEditorRootComponent,
    SandboxEditorCreateShopDialog,
  ],
})
export class SandboxEditorModule {}
