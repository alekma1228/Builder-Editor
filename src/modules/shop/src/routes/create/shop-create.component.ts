import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';

import { MessageBus, PebEnvService, PebShopContainer } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { PePlatformHeaderService } from '@pe/platform-header';

import { AbstractComponent } from '../../misc/abstract.component';

@Component({
  selector: 'peb-shop-create',
  templateUrl: './shop-create.component.html',
  styleUrls: ['./shop-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopCreateComponent extends AbstractComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('logo') logoEl: ElementRef;
  @ViewChild('logoWrapper') logoWrapperEl: ElementRef;

  @Input() showCreateButton = true;

  @Output() valid = new EventEmitter<boolean>();
  @Output() created = new EventEmitter<string>();

  form = this.formBuilder.group({
    name: ['', [ Validators.required ]],
    picture: [''],
  });
  isLargeThenParent = false;
  isLoading = false;
  uploadProgress = 0;

  get shopName(): string {
    return this.form.get('name').value;
  }

  constructor(
    private api: PebEditorApi,
    private cdr: ChangeDetectorRef,
    private envService: PebEnvService,
    private messageBus: MessageBus,
    private formBuilder: FormBuilder,
    @Optional() private platformHeader: PePlatformHeaderService,
  ) {
    super();
  }

  ngOnInit() {
    this.platformHeader?.setShortHeader({
      title: 'Create shop',
    });
    this.form.statusChanges.pipe(
      tap(() => this.valid.emit(this.form.valid)),
      takeUntil(this.destroyed$),
    ).subscribe();
    if (this.envService.businessData?.name) {
      this.form.get('name').patchValue(this.envService.businessData.name);
    }
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
    const body = this.form.value;
    if (body.picture === '') {
      delete body.picture;
    }
    this.api.createShop(body).pipe(
      tap((shop: any) => {
        this.messageBus.emit('shop.created', shop.id);
        this.created.emit(shop.id);
        this.platformHeader?.setFullHeader();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
