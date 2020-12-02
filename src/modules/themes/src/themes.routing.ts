import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebThemesComponent } from './routes/themes/themes.component';
import { PebThemesRootComponent } from './root/root-themes.component';

const routes: Routes = [
  {
    path: '',
    component: PebThemesRootComponent,
    children: [
      {
        path: '',
        component: PebThemesComponent,
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
})
export class PebThemesRoutingModule {}
