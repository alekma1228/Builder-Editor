import { CommonModule } from '@angular/common';
import { NgModule, InjectionToken } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PebViewerModule } from '@pe/builder-viewer';

import { PebShopRouteModule } from './shop.routing';
import { PebShopSharedModule } from './shop.shared';
import { PebShopListComponent } from './routes/list/shop-list.component';
import { PebShopSettingsComponent } from './routes/settings/shop-settings.component';
import { PebShopAddImageComponent } from './misc/icons/add-image.icon';
import { PebShopControlDotsComponent } from './misc/icons/control-dots.icon';
import { PebShopComponent } from './routes/_root/shop-root.component';
import { PebShopLocalDomainSettingsComponent } from './routes/settings/local-domain/shop-local-domain-settings.component';
import { PebShopExternalDomainSettingsComponent } from './routes/settings/external-domain/shop-external-domain-settings.component';
import { PebShopPasswordSettingsComponent } from './routes/settings/password/shop-password-settings.component';
import { PebShopGeneralSettingsComponent } from './routes/settings/general/shop-general-settings.component';
import { ShopResolver } from './resolvers/shop.resolver';
import { PebShopEditComponent } from './routes/edit/shop-edit.component';
import { PebShopDashboardComponent } from './routes/dashboard/shop-dashboard.component';
import { CompanyContext } from './services/company.context';
import { ProductsContext } from './services/products.context';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const PebViewerModuleForRoot = PebViewerModule.forRoot();

const icons = [
  PebShopAddImageComponent,
  PebShopControlDotsComponent,
];

@NgModule({
  imports: [
    PebShopRouteModule,
    PebShopSharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    PebViewerModuleForRoot,
    NgScrollbarModule,
  ],
  declarations: [
    ...icons,
    PebShopComponent,
    PebShopListComponent,
    PebShopEditComponent,
    PebShopSettingsComponent,
    PebShopGeneralSettingsComponent,
    PebShopLocalDomainSettingsComponent,
    PebShopExternalDomainSettingsComponent,
    PebShopPasswordSettingsComponent,
    PebShopDashboardComponent,
  ],
  providers: [
    ShopResolver,
    {
      provide: 'ContextServices.Company',
      useClass: CompanyContext,
    },
    {
      provide: 'ContextServices.Products',
      useClass: ProductsContext,
    },
  ],
})
export class PebShopModule {}
