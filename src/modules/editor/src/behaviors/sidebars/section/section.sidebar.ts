import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

import { MediaService, PebEditorApi } from '@pe/builder-api';
import { PebElementDef, PebElementStyles } from '@pe/builder-core';

import { SidebarBasic } from '../_deprecated-sidebars/sidebar.basic';
import { PebEditorElementSection } from '../../../renderer/elements/editor-element-section';

@Component({
  selector: 'peb-editor-section-sidebar',
  templateUrl: 'section.sidebar.html',
  styleUrls: [
    '../_deprecated-sidebars/sidebars.scss',
    './section.sidebar.scss',
  ],
})
export class PebEditorSectionSidebar extends SidebarBasic {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() component: PebEditorElementSection;

  // @Output() changeOrder = new EventEmitter<boolean>();

  constructor(
    public sanitizer: DomSanitizer,
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
  ) {
    super(api, mediaService, dialog);
  }

  pageNameInputEnterHandler($event: Event) {
    $event.preventDefault();
    this.component.section.form.get('name').patchValue(($event.target as HTMLInputElement).value.trim())
  }

  moveSection(moveUp: boolean): void {
    this.component.section.form.get('moveElement').patchValue(moveUp);
  }

  addSection(after?: boolean): void {
    this.component.section.initialValue.isFirstSection = false;
    this.component.section.form.get('newElement').patchValue(after);
  }
}
