import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';
import { merge } from 'rxjs';

import { PebPageShort, PebPageVariant, PebShopRoute } from '@pe/builder-core';

import { AbstractComponent } from '../../../../misc/abstract.component';

@Component({
  selector: 'peb-editor-seo-sidebar',
  templateUrl: 'seo.sidebar.html',
  styleUrls: [
    './seo.sidebar.scss',
    '../sidebars.scss',
  ],
})
export class PebEditorSeoSidebar extends AbstractComponent implements OnInit {
  @Input() page: PebPageShort;
  @Input() url: string;

  @Output() changeTitle = new EventEmitter<any>();
  @Output() changeUrl = new EventEmitter<string>();
  @Output() changeDescription = new EventEmitter<string>();
  @Output() changeShowInSearchResults = new EventEmitter<boolean>();
  @Output() changeCanonicalUrl = new EventEmitter<string>();
  @Output() changeMarkupData = new EventEmitter<string>();
  @Output() changeCustomMetaTags = new EventEmitter<string>();

  form: FormGroup = this.formBuilder.group({
    title: [null, { updateOn: 'blur' }],
    url: [null, { validators: [Validators.pattern(/^[\w\s\/\-\_]+$/)], updateOn: 'blur' }],
    description: [null, { updateOn: 'blur' }],
    showInSearchResults: [null, { updateOn: 'blur' }],
    canonicalUrl: [null, { validators: [Validators.pattern(/^[\w\s\/\-\_]+$/)], updateOn: 'blur' }],
    markupData: [null, { updateOn: 'blur' }],
    customMetaTags: [null, { updateOn: 'blur' }],
  });

  constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.form.patchValue({
      title: this.page.name,
      url: this.url,
      description: this.page.data.description,
      showInSearchResults: this.page.data.showInSearchResults,
      canonicalUrl: this.page.data.canonicalUrl,
      markupData: this.page.data.markupData,
      customMetaTags: this.page.data.customMetaTags,
    });
    if (this.page.variant === PebPageVariant.Front) {
      this.form.controls.url.disable();
    }
    merge(
      this.form.get('title').valueChanges.pipe(
        tap((value) => {
          this.changeTitle.emit({ name: value });
        }),
      ),
      this.form.get('url').valueChanges.pipe(
        tap((value) => {
          if (this.form.get('url').valid) {
            this.changeUrl.emit(value);
          }
        }),
      ),
      this.form.get('description').valueChanges.pipe(
        tap((value) => this.changeDescription.emit(value)),
      ),
      this.form.get('showInSearchResults').valueChanges.pipe(
        tap((value) => this.changeShowInSearchResults.emit(value)),
      ),
      this.form.get('canonicalUrl').valueChanges.pipe(
        tap((value) => {
          if (this.form.get('canonicalUrl').valid) {
            this.changeCanonicalUrl.emit(value);
          }
        }),
      ),
      this.form.get('markupData').valueChanges.pipe(
        tap((value) => this.changeMarkupData.emit(value)),
      ),
      this.form.get('customMetaTags').valueChanges.pipe(
        tap((value) => this.changeCustomMetaTags.emit(value)),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
