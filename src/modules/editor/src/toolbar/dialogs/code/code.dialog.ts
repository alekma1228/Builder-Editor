import { Component, Inject } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { OverlayData, OVERLAY_DATA } from '../../overlay.data';

@Component({
  selector: 'peb-editor-code-dialog',
  templateUrl: 'code.dialog.html',
  styleUrls: ['./code.dialog.scss'],
})
export class PebEditorCodeDialogComponent {
  readonly htmlType = {
    type: PebElementType.Html,
    name: 'HTML',
    data: {
      innerHTML: '<h3>Inserted html element</h3>',
    },
    style: {
      width: '',
      height: '',
    },
  };
  readonly jsType = {
    type: PebElementType.Script,
    name: 'JavaScript',
    data: {
      script: 'function a() {let a = 5; return a;}',
    },
    style: {
      width: '',
      height: '',
    },
  };

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
  ) {}

  setValue({type, data, style}): void {
    this.data.emitter.next({type, data, style});
  }
}
