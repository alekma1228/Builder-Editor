import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { PebElementDef, PebElementStyles, PebShopContainer } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { AbstractComponent } from '../../../../misc/abstract.component';
import { SelectedMedia } from '../shared/media-tab/media-tab.component';

enum GallerySubTab {
  Media = 'media',
  Selected = 'selected',
}

enum GalleryTabs {
  Gallery = 'Gallery',
  Arrange = 'Arrange',
}

export interface Slide {
  sourceUrl: string;
  title: string;
}

@Component({
  selector: 'peb-editor-carousel-sidebar',
  templateUrl: './carousel.sidebar.html',
  styleUrls: ['./carousel.sidebar.scss', '../sidebars.scss'],
})
export class PebEditorCarouselSidebarComponent extends AbstractComponent
  implements OnInit {
  GallerySubTab = GallerySubTab;

  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;

  @Output() changeStyles = new EventEmitter<{ height: string }>();
  @Output() changeData = new EventEmitter<any>();
  @Output() changeSlide = new EventEmitter<number>();

  @ViewChild('fileInput') fileInput: ElementRef;

  arrangeForm: FormGroup;
  gallerySubTab = GallerySubTab.Selected;
  isLoading: boolean;
  uploadProgress: number;

  readonly GalleryTabs: typeof GalleryTabs = GalleryTabs;

  private readonly slidesSubject$ = new BehaviorSubject<Slide[]>([]);
  readonly slides$ = this.slidesSubject$.asObservable();
  set slides(val: Slide[]) {
    this.slidesSubject$.next(val);
  }
  get slides() {
    return this.slidesSubject$.value;
  }

  private readonly selectedSlideIndexSubject$ = new BehaviorSubject<number>(0);
  readonly selectedSlideIndex$ = this.selectedSlideIndexSubject$.asObservable();
  set selectedSlideIndex(val: number) {
    this.selectedSlideIndexSubject$.next(val);
  }
  get selectedSlideIndex() {
    return this.selectedSlideIndexSubject$.value;
  }

  private editingSlideIndex: number = null;

  constructor(
    private apiService: PebEditorApi,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.slides = this.createInitialSlides(this.element.data);
    this.arrangeForm = this.createInitialForm(this.styles);

    merge(
      this.passArrangeFormChangesToOutput,
      this.passCarouselCurrentSlideToOutput,
      this.passCarouselSlidesToOutput,
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe();
  }

  createInitialSlides(elementData) {
    return elementData.images.map((image, index) => {
      return {
        sourceUrl: image,
        title: 'Slide ' + (index + 1),
      };
    });
  }

  createInitialForm(elementStyles: PebElementStyles) {
    return new FormGroup({
      size: new FormGroup({
        height: new FormControl(elementStyles.height || 300),
      }),
    });
  }

  addOrReplaceSlide(imgUrl: string) {
    if (this.editingSlideIndex === null) {
      this.slides = [
        ...this.slides,
        { sourceUrl: imgUrl, title: 'Slide ' + (this.slides.length + 1) },
      ];
      return;
    }

    if (this.slides.length) {
      const slides = this.slides;
      slides[this.editingSlideIndex].sourceUrl = imgUrl;
      this.slides = slides;
    } else {
      this.slides = [
        ...this.slides,
        { sourceUrl: imgUrl, title: 'Slide ' + this.slides.length },
      ];
    }

    this.editingSlideIndex = null;
  }

  deleteSlide(index?: number) {
    const deletingIndex = index || this.selectedSlideIndex;
    this.slides = this.slides.filter((el, i) => i !== deletingIndex);

    if (this.selectedSlideIndex + 1 > this.slides.length) {
      this.selectedSlideIndex = this.slides.length - 1;
    }
  }

  selectSlide(index: number) {
    this.selectedSlideIndex = index;
  }

  moveSlides(event: CdkDragDrop<any[]>) {
    const slides = this.slides;
    moveItemInArray(slides, event.previousIndex, event.currentIndex);
    this.slides = slides;
    this.selectSlide(event.currentIndex);
  }

  onFileChange($event: any) {
    const files: FileList = $event.target.files;
    const file: File = files.item(0);
    this.addOrReplaceSlide(null);

    this.isLoading = true;
    // TODO: Find another way to display spinners
    // this.changeData.emit({ isLoading: true });
    this.apiService
      .uploadImageWithProgress(PebShopContainer.Images, files.item(0))
      .pipe(
        tap(event => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              this.uploadProgress = event.loaded;
              this.cdr.detectChanges();
              break;
            }
            case HttpEventType.Response: {
              this.editingSlideIndex = this.slides.length - 1;
              this.addOrReplaceSlide(event.body.blobName);
              this.isLoading = false;
              this.uploadProgress = 0;
              break;
            }
            default:
              break;
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  replaceToDownloaded(index: number = null) {
    this.fileInput.nativeElement.click();
    this.editingSlideIndex = index;
  }

  replaceToMediaImage(index: number = null) {
    this.editingSlideIndex = index;
    this.gallerySubTab = GallerySubTab.Media;
  }

  onMediaImageSelected(imageUrls: SelectedMedia) {
    this.addOrReplaceSlide(imageUrls.source);
    this.gallerySubTab = GallerySubTab.Selected;
  }

  private get passArrangeFormChangesToOutput(): Observable<any> {
    return this.arrangeForm.valueChanges.pipe(
      tap(formVal => {
        this.changeStyles.emit({
          height: formVal.size.height || this.styles.height,
        });
      }),
    );
  }

  private get passCarouselSlidesToOutput(): Observable<any> {
    return this.slides$.pipe(
      tap((slides: Slide[]) => {
        this.changeData.emit({
          images: slides.map(slide => slide.sourceUrl),
        });
      }),
    );
  }

  private get passCarouselCurrentSlideToOutput(): Observable<number> {
    return this.selectedSlideIndexSubject$.pipe(
      tap((selected: number) => {
        this.changeSlide.emit(selected);
      }),
    );
  }
}
