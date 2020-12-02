import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, Optional, ViewChild } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpEventType } from '@angular/common/http';

import { MessageBus, PebShopContainer } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { PePlatformHeaderService } from '@pe/platform-header';

import { AbstractComponent } from '../../misc/abstract.component';

@Component({
  selector: 'peb-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopEditComponent extends AbstractComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('logo') logoEl: ElementRef;
  @ViewChild('logoWrapper') logoWrapperEl: ElementRef;

  isLargeThenParent = false;
  isLoading = false;
  uploadProgress = 0;

  form: FormGroup
  shop: any;

  constructor(
    private api: PebEditorApi,
    private activatedRoute: ActivatedRoute,
    private messageBus: MessageBus,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    @Optional() private platformHeader: PePlatformHeaderService,
  ) {
    super();
    this.form = this.formBuilder.group({
      name: ['', [ Validators.required ]],
      picture: [''],
    });
  }

  ngOnInit() {
    this.platformHeader?.setShortHeader({
      title: 'Edit shop',
    });
    const shopId = this.activatedRoute.parent.snapshot.params.shopId;
    this.api.getShop(shopId).pipe(
      tap((shop: any) => {
        this.shop = shop;
        this.form.controls.name.patchValue(shop.name);
        this.form.controls.picture.patchValue(shop.picture);
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onLogoUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLoading = true;
      this.isLargeThenParent = false;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';

      reader.onload = () => {
        this.api.uploadImageWithProgress(PebShopContainer.Images, file).subscribe((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              this.uploadProgress = event.loaded;
              this.cdr.detectChanges();
              break;
            }
            case HttpEventType.Response: {
              this.form.patchValue({ picture: event.body.blobName || reader.result as string });
              this.isLoading = false;
              this.uploadProgress = 0;
              this.cdr.detectChanges();
              break;
            }
            default: break;
          }
        });
      };
    }
  }

  onLoad() {
    const logo: HTMLImageElement = this.logoEl.nativeElement;
    const logoWrapper: HTMLImageElement = this.logoWrapperEl.nativeElement;
    this.isLargeThenParent = logo.width >= logoWrapper.clientWidth || logo.height >= logoWrapper.clientHeight;
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.form.disable();
    this.api.updateShop({
      name: this.form.value.name,
      picture: this.form.value.picture ? this.form.value.picture : null
    }).pipe(
      tap((shop: any) => {
        this.messageBus.emit('shop.edited', shop.id);
        this.platformHeader?.setFullHeader();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
