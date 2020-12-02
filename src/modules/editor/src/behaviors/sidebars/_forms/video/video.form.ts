import { FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { finalize, takeUntil, tap } from 'rxjs/operators';

import { PebMediaService, PebShopContainer } from '@pe/builder-core';
import { AbstractComponent } from '../../../../misc/abstract.component';
import { SelectedMedia } from '../../_deprecated-sidebars/shared/media-tab/media-tab.component';

@Component({
  selector: 'editor-video-form',
  templateUrl: './video.form.html',
  styleUrls: [
    './video.form.scss',
    '../../_deprecated-sidebars/sidebars.scss',
  ],
})
export class EditorVideoForm extends AbstractComponent {
  @Input() formGroup: FormGroup;

  @Output() fileChanged = new EventEmitter<SelectedMedia>();

  videoDuration: string;
  uploadProgress: number;
  isLoading: boolean;
  previewError = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private mediaService: PebMediaService
  ) {
    super();
  }

  get videoSource(): string {
    return this.formGroup.get('source').value;
  }

  get videoPreview(): string {
    return this.formGroup.get('preview').value;
  }

  get fileName(): string {
    return this.videoSource.substring(this.videoSource.lastIndexOf('/') + 1);
  }

  onMetadata(event: Event, video: any) {
    this.videoDuration = `${Math.round(video.duration / 60)}m ${Math.round(video.duration % 60)}sec`;
  }

  onFileChange($event: Event): void {
    const target = $event.target as HTMLInputElement;
    const files: FileList = target.files;
    this.isLoading = true;
    this.previewError = false;
    this.videoDuration = null;
    this.cdr.detectChanges();

    this.mediaService.uploadVideo(files.item(0), PebShopContainer.BuilderVideo).pipe(
      tap(({ preview, blobName }) => {
        this.fileChanged.emit({source: blobName, preview: preview});
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

  }
}
