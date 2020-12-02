import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, takeUntil, tap } from 'rxjs/operators';
import { merge, BehaviorSubject, EMPTY } from 'rxjs';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import {
  PebElementDef,
  PebElementStyles,
  PebElementType, PebShopContainer,
} from '@pe/builder-core';
import { MediaService, PebEditorApi } from '@pe/builder-api';

import { AbstractComponent } from '../../../misc/abstract.component';
import { StyleForm } from './image-form.interface';
import { hexToRgba } from '../../../utils';
import { predefinedStyles } from './image.constants';
import { PebEditorElement } from '../../../renderer/editor-element';
import { PebEditorSnackbarComponent } from '../../../components/snackbar/snackbar.component';
import { PebEditorNumberInputComponent } from '../_deprecated-sidebars/shared/number-input/number-input.component';
import { SelectedMedia } from '../_deprecated-sidebars/shared/media-tab/media-tab.component';
import { PebEditorState } from "../../../services/editor.state";

enum ImageSubTab {
  Media = 'media',
  Details = 'details',
}

type ImageResponse = {
  progress: number;
  body: {blobName: string, brightnessGradation: string, thumbnail: string}
}

@Component({
  selector: 'peb-editor-image-sidebar',
  templateUrl: './image.sidebar.html',
  styleUrls: ['./image.sidebar.scss', '../_deprecated-sidebars/sidebars.scss'],
})
export class PebEditorImageSidebar extends AbstractComponent implements OnInit {
  ImageSubTab = ImageSubTab;

  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() imgSrc?: string;
  @Input() component: PebEditorElement;

  @Output() changeStyle = new EventEmitter<any>();
  @Output() changeStyleFinal = new EventEmitter<any>();

  @Output() changeData = new EventEmitter<any>();

  readonly PebElementType = PebElementType;

  form: FormGroup;
  imageSubTab = ImageSubTab.Media;
  predefinedStyles = predefinedStyles;
  uploadProgress = new BehaviorSubject<number>(0);
  isLoading: boolean;
  imageForm: FormGroup = this.formBuilder.group({
    src: '',
  });
  currentUploadName = '';

  isLoading$ = new BehaviorSubject<boolean>(false);

  get imageSource() {
    return this.imageForm.get('src')
  }
  private imageSource$ = this.imageSource.valueChanges;

  private activeElement: PebEditorNumberInputComponent = null;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: PebEditorApi,
    private snackBar: MatSnackBar,
    private mediaService: MediaService,
    private state: PebEditorState,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.element.type === PebElementType.Logo) {
      this.imageSubTab = ImageSubTab.Details;
    }
    this.form = this.initForm();
    this.form.get('sync').patchValue(this.element.data?.sync);
    this.imageForm.patchValue({
      src: this.imgSrc,
    });

    merge(
      this.imageSource$.pipe(
        tap(src => {
          this.changeData.emit({ srcScreens: { [this.state.screen]: src } });
        }),
      ),
      this.styleForm.valueChanges.pipe(
        map((formValue: StyleForm) => this.fromFormToStyles(formValue)),
        tap(styles => this.changeStyleFinal.emit(styles)),
      ),
      this.form.get('sync').valueChanges.pipe(
        tap(value => {
          this.changeData.emit({sync: value});
          if (value) {
            this.changeStyleFinal.emit(this.fromFormToStyles(this.styleForm.value));
          }
        }),
      ),
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe();
  }

  onElementFocus(element: PebEditorNumberInputComponent) {
    this.activeElement = element;
  }
  onElementBlur(element: PebEditorNumberInputComponent) {
    this.activeElement = null;
  }

  get styleForm(): FormGroup {
    return this.form.get('style') as FormGroup;
  }

  get borderForm(): FormGroup {
    return this.styleForm.get('border') as FormGroup;
  }

  get shadowForm(): FormGroup {
    return this.styleForm.get('shadow') as FormGroup;
  }

  get arrangeForm(): FormGroup {
    return this.form.get('arrange') as FormGroup;
  }

  get fileName(): string {
    const url = this.imageSource.value;
    return url.substring(url.lastIndexOf('/') + 1);
  }

  onFileChange($event: Event): void {
    const target = $event.target as HTMLInputElement;
    const files: FileList = target.files;

    this.isLoading$.next(true);
    this.imageSource.patchValue('');
    this.currentUploadName = files.item(0).name;

    this.mediaService.uploadImageWithProgress(files.item(0), PebShopContainer.Builder).pipe(
      tap((data: ImageResponse) => {
        this.uploadProgress.next(data.progress)
        if (data.body) {
          const { blobName } = data.body
          this.imageSource.patchValue(blobName);
        }
      }),
      catchError(({ error }) => {
        this.openSnackbar(error.message, false);
        this.isLoading$.next(false);
        return EMPTY;
      }),
      finalize(() => this.isLoading$.next(false)),
      takeUntil(this.destroyed$),
    ).subscribe();

  }

  onSelect(imageUrls: SelectedMedia) {
    this.imageSource.patchValue(imageUrls.source);
  }

  flipVertical() {
    const scaleInput = this.form.get('arrange').get('scaleY');

    this.arrangeForm
      .get('scaleY')
      .patchValue(scaleInput.value === 1 ? -1 : 1);
  }

  flipHorizontal() {
    const scaleInput = this.form.get('arrange').get('scaleX');

    this.arrangeForm
      .get('scaleX')
      .patchValue(scaleInput.value === 1 ? -1 : 1);
  }

  patchForm(styles = this.styles, form = this.form): void {
    form.patchValue({
      style: {
        border: {
          enabled: !!styles.border,
          type: styles.borderType || 'solid',
          color: styles.borderColor || '#000000',
          size: styles.borderSize || 1,
        },
        shadow: {
          enabled: !!styles.filterShadow,
          blur: styles.shadowBlur || 5,
          offset: styles.shadowOffset || 10,
          opacity: styles.shadowOpacity || 100,
          angle: styles.shadowAngle ? styles.shadowAngle : 315,
          color: styles.shadowFormColor || '#000000',
        },
        opacity: styles.opacity != null
          ? Math.round(+styles.opacity * 100)
          : 100,
      },
      arrange: {
        size: {
          width: styles.width ?? 0,
          height: styles.height ?? 0,
        },
        position: {
          posX: styles.left ?? 0,
          posY: styles.top ?? 0,
        },
        angle: styles.rotate ?? 0,
        scaleX: styles.scaleX ?? 1,
        scaleY: styles.scaleY ?? 1,
      },
    });
  }

  private initForm(): FormGroup {
    const form = this.formBuilder.group({
      style: this.formBuilder.group({
        border: this.formBuilder.group({
          enabled: [false],
          type: [''],
          color: [''],
          size: [1, [Validators.min(1), Validators.max(100)]],
        }),
        shadow: this.formBuilder.group({
          enabled: [false],
          blur: [5],
          offset: [10],
          opacity: [100],
          angle: [315],
          color: [''],
        }),
        opacity: [100],
      }),
      arrange: this.formBuilder.group({
        size: this.formBuilder.group({
          width: [0],
          height: [0],
        }),
        position: this.formBuilder.group({
          posX: [0],
          posY: [0],
        }),
        angle: [0],
        scaleX: [1],
        scaleY: [1],
      }),
      sync: [false],
    });
    this.patchForm(this.styles, form);
    return form;
  }

  private fromFormToStyles(formValue: StyleForm): { [key: string]: string } {
    const res: any = {};

    if (formValue.border.enabled) {
      res.borderSize = formValue.border.size;
      res.borderType = formValue.border.type;
      res.borderColor = formValue.border.color;
      res.border = `${res.borderSize}px ${res.borderType} ${res.borderColor}`;
    } else {
      res.border = false;
    }
    if (formValue.shadow.enabled) {
      res.shadowBlur = formValue.shadow.blur;
      res.shadowFormColor = formValue.shadow.color;
      res.shadowColor = formValue.shadow.color
        ? hexToRgba(
            formValue.shadow.color,
            formValue.shadow.opacity,
          )
        : '#000000';
      res.shadowAngle = formValue.shadow.angle;
      res.shadowOpacity = formValue.shadow.opacity;
      res.shadowOffset = formValue.shadow.offset;
      const angle = res.shadowAngle * (Math.PI / 180);
      const x = Math.round(res.shadowOffset * Math.cos(angle));
      const y = Math.round(res.shadowOffset * -Math.sin(angle));

      res.filterShadow = `drop-shadow(${x}px ${y}px ${res.shadowBlur}px ${res.shadowColor}`;
    } else {
      res.filterShadow = false;
    }

    res.opacity =
    formValue.opacity || formValue.opacity === 0
      ? Number(formValue.opacity) / 100
      : 1;

    return res;
  }

  setElementSizeFromImage(src: string) {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const diff = width / height;
      width = width > 1024 ? 1024 : width;
      height = 1024 / diff;
      const size = this.form.get('arrange').get('size');
      size.get('width').patchValue(width);
      size.get('height').patchValue(height);
    };
    img.src = src;
  }

  private openSnackbar(text: string, success: boolean): MatSnackBarRef<any> {
    return this.snackBar.openFromComponent(PebEditorSnackbarComponent, {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: 'mat-snackbar-shop-panel-class',
      data: {
        text,
        icon: success ? '#icon-snackbar-success' : '#icon-snackbar-error',
      },
    })
  }
}
