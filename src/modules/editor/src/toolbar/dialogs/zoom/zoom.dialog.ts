import { Component, Inject } from '@angular/core';

import { OverlayData, OVERLAY_DATA } from '../../overlay.data';

@Component({
  selector: 'peb-editor-zoom-dialog',
  templateUrl: 'zoom.dialog.html',
  styleUrls: ['./zoom.dialog.scss'],
})
export class PebEditorZoomDialogComponent {
  scales = [33, 50, 75, 100, 150, 200, 300];

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
  ) {}

  setValue(value: number): void {
    this.data.emitter.next(value);
  }
}
