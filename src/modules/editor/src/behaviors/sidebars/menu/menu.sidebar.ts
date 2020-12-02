import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebAbstractSidebar } from '../sidebar.abstract';
import { PebEditorElementMenu } from '../../../renderer/elements/editor-element-menu';

@Component({
  selector: 'peb-editor-menu-sidebar',
  templateUrl: 'menu.sidebar.html',
  styleUrls: ['./menu.sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMenuSidebar extends PebAbstractSidebar {
  @Input() component: PebEditorElementMenu;
}
