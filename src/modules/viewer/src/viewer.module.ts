import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PebRendererModule } from '@pe/builder-renderer';

import { PebViewer } from './viewer/viewer';
import { defaultScreenThresholds, ScreenThresholds, SCREEN_FROM_WIDTH, SCREEN_THRESHOLDS } from './viewer.constants';
import { screenFromWidthFactory } from './viewer.utils';
import { PebViewerPreviewDialog } from './preview-dialog/preview.dialog';
import { ViewerIconsModule } from './icons/_icons.module';
import { PebViewerDeviceFrameComponent } from './preview-dialog/device-frame/device-frame.component';

const exports = [
  PebViewer,
  PebViewerPreviewDialog,
];

@NgModule({
  declarations: [
    ...exports,
    PebViewerDeviceFrameComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    NgScrollbarModule,
    PebRendererModule,
    ViewerIconsModule,
  ],
  exports,
})
export class PebViewerModule {
  static forRoot(thresholds: ScreenThresholds = defaultScreenThresholds): ModuleWithProviders {
    return {
      ngModule: PebViewerModule,
      providers: [
        // TODO: At certain point it would be better to store such things as thresholds
        //       inside theme, but for now this values are predefined for everyone
        {
          provide: SCREEN_THRESHOLDS,
          useValue: thresholds,
        },
        {
          provide: SCREEN_FROM_WIDTH,
          useValue: screenFromWidthFactory(thresholds),
        },
      ],
    }
  }

  constructor(
    @Optional() @Inject(SCREEN_THRESHOLDS) thresholds: any,
    @Optional() @Inject(SCREEN_FROM_WIDTH) screenFromWidth: any,
  ) {
    if (!thresholds || !screenFromWidth) {
      console.error('Viewer module should be imported with `forRoot()`');
    }
  }
}
