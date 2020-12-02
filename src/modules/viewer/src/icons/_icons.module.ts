import { NgModule } from '@angular/core';

import { PebThemesPreviewBackIconComponent } from './preview-back.icon';
import { PebThemesPreviewDesktopIconComponent } from './preview-desktop.icon';
import { PebThemesPreviewMobileIconComponent } from './preview-mobile.icon';
import { PebThemesPreviewTabletIconComponent } from './preview-tablet.icon';

const icons = [
  PebThemesPreviewBackIconComponent,
  PebThemesPreviewDesktopIconComponent,
  PebThemesPreviewMobileIconComponent,
  PebThemesPreviewTabletIconComponent,
]

@NgModule({
  declarations: icons,
  exports: icons,
})
export class ViewerIconsModule {}
