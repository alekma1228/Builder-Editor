import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { merge, Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { PebElementStyles, PebPageShort, PebPageVariant, PebShop } from '@pe/builder-core';
import { MediaService, PebEditorApi } from '@pe/builder-api';

import {
  BgGradient,
  getBgScale,
  getGradientProperties,
  getSelectedOption,
  initFillType,
  PageSidebarDefaultOptions,
} from '../sidebar.utils';
import { SidebarBasic } from '../sidebar.basic';
import { PebEditorElement } from '../../../../renderer/editor-element';

@Component({
  selector: 'peb-editor-page-sidebar',
  templateUrl: 'page.sidebar.html',
  styleUrls: [
    './page.sidebar.scss',
    '../sidebars.scss',
  ],
})
export class PebEditorPageSidebarComponent extends SidebarBasic implements OnInit {
  @Input() page: PebPageShort;
  @Input() shop: PebShop;
  @Input() component: PebEditorElement;
  @Input() styles: PebElementStyles;

  @Output() changePageName = new EventEmitter<string>();
  @Output() changePageType = new EventEmitter<any>();
  @Output() changeRootPage = new EventEmitter<boolean>();
  @Output() changeBgImage = new EventEmitter<string>();
  @Output() changeImageOptions = new EventEmitter<any>();
  @Output() changeImageScale = new EventEmitter<number>();
  @Output() changeStyle = new EventEmitter<any>();

  constructor(
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) {
    super(api, mediaService, dialog);
  }

  ngOnInit() {
    this.initForm();
    this.watchOnChanges();
  }


  pageNameInputEnterHandler($event: Event) {
    $event.preventDefault();
    this.changePageName.emit(($event.target as HTMLInputElement).value.trim());
  }

  private fieldEmit(filedName: string, emitter: EventEmitter<any>): Observable<any> {
    return this.form.get(filedName).valueChanges.pipe(
      tap((value: any) => {
        emitter.emit(value);
      }),
    );
  }

  private initForm() {
    this.form = this.formBuilder.group({
      name: [this.page.name, { updateOn: 'blur' }],
      type: [getSelectedOption(
        this.PageTypes, this.page.variant, PageSidebarDefaultOptions.PageType,
      )],
      root: [this.page.variant === PebPageVariant.Front],
    });
  }

  private watchOnChanges() {
    merge(
      this.fieldEmit('root', this.changeRootPage),
      this.fieldEmit('type', this.changePageType),

      this.form.get('name').valueChanges.pipe(
        tap((value: string) => {
          this.changePageName.emit(value);

          if (!value) {
            this.form.patchValue({name: this.page.name}, { emitEvent: false });
          }
        }),
      ),
  ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

  }
}
