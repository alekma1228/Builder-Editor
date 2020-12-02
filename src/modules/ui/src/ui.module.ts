import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ColorPickerModule } from '@pe/color-picker';

import { PeFeatureFlagModule } from '@pe/feature-flag';
import { PebDocumentTreeItemIconComponent } from './document-tree/components/document-tree-item-icon/document-tree-item-icon.component';
import { PebDocumentTreeComponent } from './document-tree/document-tree.component';
import { PebPagesSidebarAddButtonComponent } from './pages-list/components/pages-add-button/pages-add-button.component';
import { PebPagesSidebarItemIconComponent } from './pages-list/components/pages-list-item-icon/pages-list-item-icon.component';
import { PebPagesSidebarItemComponent } from './pages-list/components/pages-list-item/pages-list-item.component';
import { PebPagesSidebarComponent } from './pages-list/pages-list.component';
import { PebPageToolbarComponent } from './toolbars/page/page.component';
import { PebProductPageToolbarComponent } from './toolbars/product-page/product-page.component';
import { PebTextToolbarComponent } from './toolbars/text/text.component';

@NgModule({
  declarations: [
    PebPagesSidebarComponent,
    PebDocumentTreeComponent,
    PebPagesSidebarItemComponent,
    PebPagesSidebarAddButtonComponent,
    PebPagesSidebarItemIconComponent,
    PebDocumentTreeItemIconComponent,
    PebPageToolbarComponent,
    PebProductPageToolbarComponent,
    PebTextToolbarComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkTreeModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    ColorPickerModule,
    FormsModule,
    PeFeatureFlagModule,
  ],
  exports: [
    PebPagesSidebarComponent,
    PebDocumentTreeComponent,
    PebPageToolbarComponent,
    PebProductPageToolbarComponent,
    PebTextToolbarComponent,
  ],
})
export class PebUiModule { }
