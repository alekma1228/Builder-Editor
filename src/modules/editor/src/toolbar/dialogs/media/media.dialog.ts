import { Component, Inject } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { OverlayData, OVERLAY_DATA } from '../../overlay.data';
import { ObjectCategory } from '../objects/objects.dialog';

enum MediaOptions {
  Picture = 'Picture',
  Video = 'Video',
  Gallery = 'Gallery',
}

const MEDIA_CATEGORIES: {[key: string]: ObjectCategory} = {
  [MediaOptions.Picture]: {
    type: PebElementType.Image,
    data: {
      src: '',
    },
    style: {
      height: 100,
      width: 100,
    },
  },
  [MediaOptions.Video]: {
    type: PebElementType.Video,
    data: {
      source: '',
      preview: '',
      autoplay: false,
      loop: false,
    },
    style: {
      height: 100,
      width: 100,
    },
  },
  [MediaOptions.Gallery]: {
    type: PebElementType.Carousel,
    data: {
      src: '',
    },
    style: {
      height: null,
      width: null,
    },
  },
};
@Component({
  selector: 'peb-editor-media-dialog',
  templateUrl: 'media.dialog.html',
  styleUrls: ['./media.dialog.scss'],
})
export class PebEditorMediaDialogComponent {
  public readonly mediaOptions: typeof MediaOptions = MediaOptions;

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
  ) {}

  public addMedia(mediaType: MediaOptions): void {
    this.data.emitter.next(MEDIA_CATEGORIES[mediaType]);
  }
}
