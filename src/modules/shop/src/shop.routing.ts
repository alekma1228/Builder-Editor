import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebShopCreateComponent } from './routes/create/shop-create.component';
import { PebShopListComponent } from './routes/list/shop-list.component';
import { PebShopSettingsComponent } from './routes/settings/shop-settings.component';
import { PebShopComponent } from './routes/_root/shop-root.component';
import { PebShopLocalDomainSettingsComponent } from './routes/settings/local-domain/shop-local-domain-settings.component';
import { PebShopExternalDomainSettingsComponent } from './routes/settings/external-domain/shop-external-domain-settings.component';
import { PebShopPasswordSettingsComponent } from './routes/settings/password/shop-password-settings.component';
import { PebShopGeneralSettingsComponent } from './routes/settings/general/shop-general-settings.component';
import { ShopResolver } from './resolvers/shop.resolver';
import { PebShopEditComponent } from './routes/edit/shop-edit.component';
import { PebShopDashboardComponent } from './routes/dashboard/shop-dashboard.component';
import { ShopThemeGuard } from './guards/theme.guard';

const routes: Routes = [
  {
    path: '',
    component: PebShopComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        component: PebShopListComponent,
      },
      {
        path: 'create',
        component: PebShopCreateComponent,
      },
      {
        path: 'edit',
        component: PebShopEditComponent,
      },
      {
        path: 'dashboard',
        component: PebShopDashboardComponent,
        canActivate: [ ShopThemeGuard ]
      },
      {
        path: 'settings',
        component: PebShopSettingsComponent,
        resolve: [ ShopResolver ],
        children: [
          {
            path: '',
            component: PebShopGeneralSettingsComponent,
          },
          {
            path: 'local-domain',
            component: PebShopLocalDomainSettingsComponent,
          },
          {
            path: 'external-domain',
            component: PebShopExternalDomainSettingsComponent,
          },
          {
            path: 'password',
            component: PebShopPasswordSettingsComponent,
          },
        ],
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [
    ShopThemeGuard
  ]
})
export class PebShopRouteModule {}
