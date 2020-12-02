import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { share, switchMap, take, takeUntil, tap, map, switchMapTo, concatMap, concatMapTo, mergeMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

import { PebShopContainer, PebShopThemeVersionEntity, PebShopThemeVersionId, PebPageShort, PebScreen, PebPageId, PebTheme } from '@pe/builder-core';
import { PebEditorApi, PEB_STORAGE_PATH } from '@pe/builder-api';

import { PebEditorStore } from '../../../services/editor.store';
import { AbstractComponent } from '../../../misc/abstract.component';
import { OverlayData, OVERLAY_DATA } from '../../overlay.data';
import { PageSnapshot } from '../../../root/abstract-editor';
import { PebEditorUtilsService } from '../../../services/editor-utils.service';

@Component({
  selector: 'peb-editor-publish-dialog',
  templateUrl: 'publish.dialog.html', // TODO: add skeleton
  styleUrls: ['./publish.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorPublishDialogComponent extends AbstractComponent implements OnInit {
  versionName: string;
  description: string;

  pages: PebPageShort[] = [];
  pageSnapshots: PageSnapshot[] = [];

  theme:PebTheme = null;

  private activePagePreviewState = {
    shouldBeUpdated: false,
    lastActionId: null,
  }

  readonly versions$ = new BehaviorSubject<PebShopThemeVersionEntity[]>([]);
  // private readonly publishedVersionIdSubject$ = new BehaviorSubject<PebShopThemeVersionId>(null);
  // get publishedVersionId$(): Observable<PebShopThemeVersionId> {
  //   return this.publishedVersionIdSubject$.asObservable().pipe(share());
  // }

  private readonly activatedVersionIdSubject$ = new BehaviorSubject<PebShopThemeVersionId>(null);
  get activatedVersionId$(): Observable<PebShopThemeVersionId> {
    return this.activatedVersionIdSubject$.asObservable().pipe(share());
  }

  private store: PebEditorStore;

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
    @Inject(PEB_STORAGE_PATH) private storagePath: string,
    private api: PebEditorApi,
    private cdr: ChangeDetectorRef,
    private utilsService: PebEditorUtilsService
  ) {
    super();
    this.store = data.data;
  }

  ngOnInit() {
    this.store.theme$.pipe(
      tap((theme) => {
        this.theme = theme;
        this.api.getSnapshot(theme.id).pipe(
          switchMap(themeSnapshot=>{
            let pages: PebPageShort[] = [];
            Object.keys(themeSnapshot.pages).forEach(pageID=>{
              pages.push(themeSnapshot.pages[pageID]);
            });
            return from(pages);
          }),
          mergeMap((page)=>{
            return this.generatePageSnapshot(page.id);
          }),
          tap((pageSnapshot)=>{
            this.pageSnapshots.push(pageSnapshot);
        })).subscribe();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.store.theme$.pipe(
      take(1),
      switchMap(theme => this.api.getShopThemeVersions(theme.id)),
      tap(versions => this.versions$.next(versions)),
      takeUntil(this.destroyed$),
    ).subscribe();

  }

  generatePageSnapshot(pageId: PebPageId) {
    return this.utilsService.constructPageSnapshot(
      this.api.getSnapshot(this.store.theme.id),
      of(pageId),
      of(PebScreen.Desktop),
      new BehaviorSubject(null)
    );
  }

  onPublishVersion(){
    this.api.createShopThemeVersion(this.theme.id, this.versionName).pipe(
      switchMap(versionEntity =>{//should have another switch map on top that changes description
        return this.api.publishShopThemeVersion(this.theme.id, versionEntity.id)
      })
    ).subscribe();
  }


}
