import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

import { MediaType } from '@pe/builder-core';

import { SelectedMedia } from '../_deprecated-sidebars/shared/media-tab/media-tab.component';
import { VideoSubTab } from '../../../renderer/editor-element';
import { PebAbstractSidebar } from '../sidebar.abstract';
import { PebEditorElementVideo } from '../../../renderer/elements/editor-element-video';

@Component({
  selector: 'peb-editor-video-sidebar',
  templateUrl: './video.sidebar.html',
  styleUrls: [
    './video.sidebar.scss',
    '../_deprecated-sidebars/sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorVideoSidebarComponent extends PebAbstractSidebar {

  MediaType = MediaType;
  VideoSubTab = VideoSubTab;

  @Input() component: PebEditorElementVideo;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  setSourceURL(videoUrls: SelectedMedia) {
    this.component.video.form.get('source').patchValue(videoUrls.source);
    this.component.video.form.get('preview').patchValue(videoUrls.preview);
    this.cdr.detectChanges();
  }
}
