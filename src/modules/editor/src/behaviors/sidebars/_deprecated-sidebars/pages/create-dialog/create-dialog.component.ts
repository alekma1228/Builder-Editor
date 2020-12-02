import { Component, Inject } from '@angular/core';

import { PebPageShort } from '@pe/builder-core';

import { OverlayData, OVERLAY_DATA } from '../../../../../toolbar/overlay.data';


@Component({
  selector: 'peb-editor-create-page-sidebar-dialog',
  templateUrl: 'create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss'],
})
export class PebEditorCreatePageDialogComponent {
  pages: PebPageShort[];
  constructor(
    @Inject(OVERLAY_DATA) public overlayData: OverlayData,
  ) {
    this.pages = overlayData.data;
  }

  select(page?: any): void {
    this.overlayData.emitter.next(page);
  }
}
