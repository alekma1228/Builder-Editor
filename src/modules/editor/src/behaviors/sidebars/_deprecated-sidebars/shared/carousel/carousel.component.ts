import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { chunk } from 'lodash';

import { PebMediaItem } from '@pe/builder-core';

@Component({
  selector: 'peb-editor-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorCarouselComponent {
  @Input()
  set images(val: PebMediaItem[]) {
    this.carouselData = chunk(val, this.elementsOnPage);
  }

  @Output() selectElement: EventEmitter<PebMediaItem> = new EventEmitter<PebMediaItem>();

  elementsOnPage = 6;

  carouselData: PebMediaItem[][];
  currentIndex = 0;

  constructor(private sanitizer: DomSanitizer) { }

  onSelect(value: PebMediaItem) {
    this.selectElement.emit(value);
  }

  getBackgroundImage(media: PebMediaItem): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${media.thumbnail || media.previewUrl}')`);
  }
}
