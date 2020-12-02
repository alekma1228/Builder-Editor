import { NgModule } from '@angular/core';

import { PebThemesRoutingModule } from './themes.routing';
import { PebThemesSharedModule } from './themes.shared';
import { PebThemesRootComponent } from './root/root-themes.component';

@NgModule({
  imports: [
    PebThemesRoutingModule,
    PebThemesSharedModule,
  ],
  declarations: [
    PebThemesRootComponent,
  ],
})
export class PebThemesModule {}
