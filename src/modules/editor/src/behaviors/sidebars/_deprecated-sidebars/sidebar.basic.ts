import { ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { merge, Observable } from 'rxjs';
import { filter, finalize, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { PebElementStyles, PebShopContainer } from '@pe/builder-core';
import { MediaService, PebEditorApi } from '@pe/builder-api';
import { PebMediaComponent } from '@pe/builder-media';

import { AbstractComponent } from '../../../misc/abstract.component';
import { isBackgroundGradient } from '../../../utils';
import { PebEditorColorPickerComponent } from './shared/color-picker/color-picker.component';
import { PebEditorSelectComponent, SelectOption } from './shared/select/select.component';
import {
  FillType,
  FillTypes,
  getBgScale,
  getFillType,
  ImageSize,
  ImageSizes,
  PageSidebarDefaultOptions,
  PageTypes,
  PebTextAlignType,
  PebTextStyleType,
} from './sidebar.utils';


export class SidebarBasic extends AbstractComponent {
  @ViewChild('bgImageInput') bgImageInput: ElementRef;
  @ViewChild('fillTypeSelect') fillTypeSelect: PebEditorSelectComponent;
  @ViewChild('bgColorInput') bgColorInput: PebEditorColorPickerComponent;

  SliderUnit = '%';
  form: FormGroup;
  styles: PebElementStyles;
  bgImageLoading = false;
  changeBgImage = new EventEmitter<string>();
  changeImageOptions = new EventEmitter<any>();
  changeImageScale = new EventEmitter<number>();
  changeStyle = new EventEmitter<any>();
  changeStyleFinal = new EventEmitter<any>();
  loadingImage = new EventEmitter<boolean>();

  readonly PageTypes: typeof PageTypes = PageTypes;
  readonly ImageSizes: typeof ImageSizes = ImageSizes;
  readonly FillTypes: typeof FillTypes = FillTypes;
  readonly FillType: typeof FillType = FillType;

  readonly textStyleType = PebTextStyleType;
  readonly textAlignType = PebTextAlignType;
  readonly linkType = PebTextStyleType;

  constructor(
    // TODO: remove api from constructor
    public api: PebEditorApi,
    public mediaService?: MediaService,
    public dialog?: MatDialog,
  ) {
    super();
  }

  getFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  openBgImageFinder(): void {
    this.bgImageInput.nativeElement.click();
  }

  changeBgInputHandler($event) {
    this.bgImageLoading = true;
    const files = $event.target.files as FileList;

    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      if (this.loadingImage) {
        this.loadingImage.emit(true);
      }

      this.mediaService.uploadImage(files.item(0), PebShopContainer.Builder).pipe(
        takeUntil(this.destroyed$),
        tap(({thumbnail, blobName}) => {
          this.form.patchValue({ bgImage: thumbnail });
          this.updateImageOptionsFieldsSetting();
          this.changeBgImage.emit(blobName);
        }),
        finalize(() => this.bgImageLoading = false),
      ).subscribe();
    }
  }

  updateImageOptionsFieldsSetting() {
    const imageSizeControl = this.form.get('imageSize');
    const imageSize: ImageSize = imageSizeControl.value.value;
    const backgroundPosition = (imageSize === ImageSize.Initial || imageSize === ImageSize.OriginalSize)
      ? 'center'
      : 'initial';
    this.changeImageOptions.emit({ backgroundPosition });
    if (this.form.get('bgImage').value) {
      imageSizeControl.enable({ emitEvent: false });
    } else {
      imageSizeControl.disable({ emitEvent: false });
      this.form.patchValue(
        { imageScale: PageSidebarDefaultOptions.ImageScale },
        { emitEvent: false },
      );
    }
  }

  updateImageScaleFieldSetting() {
    const imageSize: ImageSize = this.form.get('imageSize').value.value;
    if (
      this.form.get('fillType').value.name === FillType.ImageFill &&
      (imageSize === ImageSize.Initial ||
        imageSize === ImageSize.OriginalSize) &&
      !!this.form.get('bgImage').value
    ) {
      this.form.get('imageScale').enable({ emitEvent: false });
    } else {
      this.form.get('imageScale').disable({ emitEvent: false });
    }
  }

  getBackgroundGradient(deg?: string, start?: string, end?: string): string {
    let degrees = '90deg';
    if (deg || this.getFormControl('bgColorGradientAngle').value) {
      degrees = (deg ? deg : this.getFormControl('bgColorGradientAngle').value) + 'deg';
    }
    const startGradient = start || this.getFormControl('bgColorGradientStart').value || 'white';
    const endGradient = end || this.getFormControl('bgColorGradientStop').value || 'white';

    return `linear-gradient(${degrees}, ${startGradient}, ${endGradient})`;
  }

  protected updateGradientBackground(gradient: string): void {
    this.changeStyle.emit({ backgroundColor: '', backgroundImage: gradient, backgroundSize: null });
    const fillType = getFillType(FillType.GradientFill);
    this.form.patchValue({ fillType }, { emitEvent: false });
  }

  protected watchOnBackgroundChanges(): Observable<string | number> {
    return merge(
      this.form.get('bgColor').valueChanges.pipe(
        tap((value: string) => {
          this.changeStyle.emit({ backgroundColor: value, backgroundImage: '' });
          const fillType = getFillType(FillType.ColorFill);
          this.form.patchValue({ fillType }, { emitEvent: false });
          // Hak, need for update child select without emit event
          if (this.fillTypeSelect) {
            this.fillTypeSelect.selectedOption = fillType;
          }
        }),
      ),

      this.form.get('bgColorGradientAngle').valueChanges.pipe(
        tap((value: string) => {
          const gradient = this.getBackgroundGradient(value);
          this.updateGradientBackground(gradient);
        }),
      ),

      this.form.get('bgColorGradientStart').valueChanges.pipe(
        tap((value: string) => {
          const gradient = this.getBackgroundGradient(null, value);
          this.updateGradientBackground(gradient);
        }),
      ),

      this.form.get('bgColorGradientStop').valueChanges.pipe(
        tap((value: string) => {
          const gradient = this.getBackgroundGradient(null,null, value);
          this.updateGradientBackground(gradient);
        }),
      ),

      this.form.get('imageSize').valueChanges.pipe(
        tap((option: SelectOption) => {
          const data: any = {};
          data.backgroundSize = option.value;
          data.backgroundPosition = (option.value === ImageSize.Initial || option.value === ImageSize.OriginalSize)
            ? 'center'
            : 'initial';
          data.backgroundRepeat = 'no-repeat';
          if (option.value === ImageSize.Initial) {
            data.backgroundRepeat = 'space';
          }

          this.changeImageOptions.emit(data);
          this.updateImageScaleFieldSetting();
        }),
      ),

      this.form.get('fillType').valueChanges.pipe(
        tap((option: SelectOption) => {
          const data: any = {};

          if (option.name === FillType.ColorFill) {
            data.backgroundColor = PageSidebarDefaultOptions.BgColor;
            data.backgroundImage = '';
          } else if (option.name === FillType.ImageFill) {
            data.backgroundColor = '';
            data.backgroundImage = isBackgroundGradient(this.form.get('bgImage').value)
              ? this.form.get('bgImage').setValue('', { emitEvent: false })
              : this.form.get('bgImage').value;
          } else if (option.name === FillType.GradientFill) {
            data.backgroundSize = null;
            data.backgroundColor = '';
            data.backgroundImage = this.getBackgroundGradient();
          } else if (option.name === FillType.None) {
            data.backgroundColor = '';
            data.backgroundImage = '';
          }

          // Drop data for gradient in form
          if (option.name !== FillType.GradientFill) {
            this.form.get('bgColorGradientAngle').setValue('', { emitEvent: false });
            this.form.get('bgColorGradientStart').setValue('', { emitEvent: false });
            this.form.get('bgColorGradientStop').setValue('', { emitEvent: false });
          }

          this.form.patchValue({ bgColor: data.backgroundColor, bgImage: data.backgroundImage }, { emitEvent: false });
          // Hak, need for update child color picker without emit event
          if (this.bgColorInput) {
            this.bgColorInput.pebColorPicker = data.backgroundColor;
          }

          this.updateImageScaleFieldSetting();
          this.changeStyle.emit(data);
        }),
      ),

      this.form.get('imageScale').valueChanges.pipe(
        filter((value: number) => getBgScale(this.styles) !== value),
        tap((value: number) => {
          this.changeImageScale.emit(value);
        }),
      ),
    ).pipe(takeUntil(this.destroyed$));
  }

  openMediaStudio() {
    this.dialog.open(PebMediaComponent, {
      position: {
        top: '0',
        left: '0',
      },
      height: '100vh',
      maxWidth: '100vw',
      width: '100vw',
      panelClass: 'products-dialog',
    }).afterClosed().pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (data && data !== '') {
          this.styles.backgroundImage = data.sourceUrl;
          this.form.get('bgImage').setValue(data.thumbnail);
          this.changeBgImage.emit(data.sourceUrl);
        }
      })
  }
}
