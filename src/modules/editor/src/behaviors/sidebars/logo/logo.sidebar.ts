import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

import { PebElementStyles } from '@pe/builder-core';

import { PebAbstractSidebar } from '../sidebar.abstract';
import { PebEditorElementLogo } from '../../../renderer/elements/editor-element-logo';

@Component({
  selector: 'peb-editor-logo-sidebar',
  templateUrl: 'logo.sidebar.html',
  styleUrls: ['./logo.sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorLogoSidebar extends PebAbstractSidebar {
  @Input() component: PebEditorElementLogo;

  presets: PebElementStyles[] = [
    {
      boxShadow: null,
    },
    {
      boxShadow: '0 0 10px 0 #000000',
    },
    null,
    null,
    null,
    null,
  ]

  constructor(public cdr: ChangeDetectorRef) {
    super();
  }
}
