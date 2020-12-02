import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector, TemplatePortal } from '@angular/cdk/portal';
import { BehaviorSubject, EMPTY, from, Observable, of, Subject } from 'rxjs';
import { delay, filter, pairwise, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { NgScrollbar } from 'ngx-scrollbar';
import { findLast, last } from 'lodash';

import {
  pebGenerateId,
  PebPageId,
  PebPageShort,
  PebPageType,
  PebPageVariant,
  PebShopContainer,
  PebShopImageResponse,
} from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { toBlob } from '@pe/dom-to-image';

import { AbstractComponent } from '../../../../misc/abstract.component';
import { PebEditorState } from '../../../../services/editor.state';
import { OVERLAY_DATA } from '../../../../toolbar/overlay.data';
import { OVERLAY_POSITIONS } from '../../../../utils';
import { PebEditorCreatePageDialogComponent } from './create-dialog/create-dialog.component';
import { PebEditorStore } from '../../../../services/editor.store';
import { PageSnapshot } from '../../../../root/abstract-editor';
import { PebEditorUtilsService } from '../../../../services/editor-utils.service';

@Component({
  selector: 'peb-editor-pages-sidebar',
  templateUrl: 'pages.sidebar.html',
  styleUrls: ['./pages.sidebar.scss'],
  // TODO add changeDetection: ChangeDetectionStrategy.OnPush
})
export class PebEditorPagesSidebarComponent extends AbstractComponent implements AfterViewInit {

  constructor(
    private cdr: ChangeDetectorRef,
    private editorApi: PebEditorApi,
    private editorState: PebEditorState,
    private editorUtilsService: PebEditorUtilsService,
    private element: ElementRef,
    private injector: Injector,
    private overlay: Overlay,
    private renderer: Renderer2,
    public sanitizer: DomSanitizer,
    public store: PebEditorStore,
    private viewContainerRef: ViewContainerRef,
  ) {
    super();
  }
  ;
  readonly PageType: typeof PebPageType = PebPageType;
  readonly PebPageVariant: typeof PebPageVariant = PebPageVariant;

  @Input() pages: PebPageShort[];
  @Input() set loading(loading: boolean) {
    this.loadingSubject$.next(loading);
  };
  @Input() activePageSnapshot: PageSnapshot;

  @Output() selected = new EventEmitter<any>();
  @Output() created = new EventEmitter<any>();
  @Output() duplicated = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<any>();

  @ViewChild('pageMenu') pageMenu: TemplateRef<any>;
  @ViewChild(NgScrollbar, { static: false }) scrollbarRef: NgScrollbar;

  contextMenuPage: PebPageShort;
  private overlayRef: OverlayRef;
  private activePagePreviewState = {
    shouldBeUpdated: false,
    lastActionId: null,
  }
  private readonly loadingSubject$ = new BehaviorSubject<boolean>(true);
  readonly loading$ = this.loadingSubject$.asObservable();

  skeletonPages = Array.from({ length: 6 });

  pagesWithPreviewCapturingInProgress: {
    [id: string]: PageSnapshot,
  } = {};

  ngAfterViewInit() {
    // Check that all previews are filled and not outdated
    this.loading$.pipe(
      filter(loading => !loading),
      take(1),
      tap(() => this.updateOutdatedPagesPreviews()),
    ).subscribe();

    // Subscribe to new actions and update page previews if the page was affected
    // this.listenActionsForUpdatePreviews$.pipe(
    //   takeUntil(this.destroyed$),
    // ).subscribe();

    // Scroll to the new created page preview in Navigator sidebar pages.sidebar
    this.store.activePageId$.pipe(
      filter((activePageId) => !!activePageId),
      tap((pageId: PebPageId) => {
        if (this.pages && this.pages.map((page) => page.id).includes(pageId) && this.scrollbarRef) {
          this.scrollbarRef.scrollToElement(`[id='${pageId}']`, {})
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  getPageSnapshot(pageId: PebPageId): PageSnapshot {
    if (pageId === this.activePageSnapshot.id) {
      return this.activePageSnapshot;
    } else {
      return this.pagesWithPreviewCapturingInProgress[pageId];
    }
  }

  onSelect(selectedPage: PebPageShort) {
    // if active page preview should be updated when we leave it
    if (this.activePagePreviewState.shouldBeUpdated) {
      // save current page id as previous page id before switch to selected page
      const previousPageId = this.activePageSnapshot.id;
      this.startCapturingPagePreview(previousPageId, this.activePageSnapshot).pipe(
        // switch current page to selected page asap for faster user experience
        tap(() => this.selected.emit(selectedPage)),
        // update previous page preview image
        switchMap(() => this.updatePagePreviewAndFinish(previousPageId, this.activePagePreviewState.lastActionId)),
        tap(() => {
          this.activePagePreviewState.shouldBeUpdated = false;
          this.activePagePreviewState.lastActionId = null;
        }),
      ).subscribe();
    }

    // if not just switch current page to selected page
    this.selected.emit(selectedPage);
  }

  onCreate(element: HTMLElement) {
    if (this.editorState.pagesView === PebPageType.Master) {
      this.createPage();
    } else {
      this.createReplicaPageDialog(element);
    }
  }

  private createReplicaPageDialog(connectTo: HTMLElement) {
    const masterPages = Object
      .values((this.store.snapshot as any).pages)
      .filter((page: any) => page.type === PebPageType.Master); // TODO: Set proper type

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(connectTo)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: 'dialog-publish-panel',
      disposeOnNavigation: true,
      maxHeight: '500px',
    });
    const emitter: Subject<any> = new Subject();
    const emitter$: Observable<any> = emitter.asObservable();
    const injectionTokens = new WeakMap();
    injectionTokens.set(OVERLAY_DATA, { data: masterPages, emitter });
    const injector = new PortalInjector(this.injector, injectionTokens);
    const portal = new ComponentPortal(PebEditorCreatePageDialogComponent, null, injector);

    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().pipe(tap(() => this.detachOverlay())).subscribe();

    emitter$.pipe(
      tap(() => this.detachOverlay()),
      tap((selectedMaster) => this.createPage(selectedMaster)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  createPage(selectedMaster?: PebPageShort) {
    this.closeContextMenu();
    this.created.emit({
      type: this.editorState.pagesView,
      masterId: selectedMaster?.id,
    });
  }

  deletePage(page: PebPageShort) {
    if (page.variant === PebPageVariant.Front) {
      return;
    }
    this.closeContextMenu();
    this.deleted.emit(page)
  }

  isPageRemovable(page: PebPageShort): boolean {
    if (page.type !== this.PageType.Master) {
      return true;
    }

    const isMasterPageReplicated = Object.keys(this.store.snapshot.pages).some(pageId => {
      const innerPage = this.store.snapshot.pages[pageId];
      return innerPage.master != null && innerPage.master.id === page.id;
    })

    return !isMasterPageReplicated;
  }

  duplicatePage(page: PebPageShort) {
    this.closeContextMenu();
    this.duplicated.emit(page)
  }

  openContextMenu(evt: MouseEvent, page: PebPageShort) {
    this.closeContextMenu();
    if ((window as any).PEB_CONTEXT_MENUS_DISABLED) {
      console.warn(
        'Context menus are disabled.\n'
        + 'Activate them by setting "PEB_CONTEXT_MENUS_DISABLED = false"',
      );
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    this.contextMenuPage = page;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(evt)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
    ).subscribe();

    this.overlayRef.attach(new TemplatePortal(this.pageMenu, this.viewContainerRef));
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  private detachOverlay(): void {
    if (this.hasOverlayAttached()) {
      this.overlayRef.detach();
    }
  }
  private hasOverlayAttached(): boolean {
    return this.overlayRef && this.overlayRef.hasAttached();
  }

  // private get listenActionsForUpdatePreviews$() {
  //   return this.store.source$.pipe(
  //     pairwise(),
  //     tap(([previousSource, currentSource]) => {
  //       if (previousSource.hash !== currentSource.hash) {
  //         const lastAction = last(currentSource.actions);
  //         lastAction.affectedPageIds.forEach(pageId => {
  //           if (pageId !== this.activePageSnapshot.id) {
  //             this.editorUtilsService.constructPageSnapshot(
  //               this.store.snapshot$.pipe(skip(1)),
  //               of(pageId),
  //               this.editorState.screen$,
  //               new BehaviorSubject(null),
  //             ).pipe(
  //               take(1),
  //               switchMap(pageSnapshot => this.startCapturingPagePreview(pageId, pageSnapshot)),
  //               switchMap(() => this.updatePagePreviewAndFinish(pageId, lastAction.id)),
  //             ).subscribe();
  //           } else {
  //             this.activePagePreviewState.shouldBeUpdated = true;
  //             this.activePagePreviewState.lastActionId = lastAction.id
  //           }
  //         });
  //       }
  //     }),
  //   );
  // }

  private updateOutdatedPagesPreviews() {
    // if (this.store.source.previews) {
    //   this.pages.forEach(page => {
    //     const lastAction = findLast(this.store.source.actions, (act) => act.affectedPageIds?.indexOf(page.id) >= 0);

    //     if (!this.store.source.previews[page.id] ||
    //       (lastAction && this.store.source.previews[page.id].actionId !== lastAction.id)
    //     ) {
    //       this.editorUtilsService.constructPageSnapshot(
    //         this.store.snapshot$,
    //         of(page.id),
    //         this.editorState.screen$,
    //         new BehaviorSubject(null),
    //       ).pipe(
    //         take(1),
    //         switchMap(pageSnapshot => this.startCapturingPagePreview(page.id, pageSnapshot)),
    //         switchMap(() => this.updatePagePreviewAndFinish(
    //           page.id, lastAction ? lastAction.id : this.store.source.actions[0].id,
    //         )),
    //       ).subscribe();
    //     }
    //   })
    // }
  }

  // Should be run before this.updatePagePreviewAndFinish
  private startCapturingPagePreview(pageId: PebPageId, pageSnapshot: PageSnapshot) {
    this.pagesWithPreviewCapturingInProgress[pageId] = pageSnapshot;
    this.cdr.detectChanges();
    return of(true);
  }

  // Should be run after this.startCapturingPagePreview
  private updatePagePreviewAndFinish(pageId: PebPageId, lastActionId: string): Observable<any> {
    const pagePreviewElement = this.element.nativeElement.querySelector(`.page[id="${pageId}"] .page__preview`);
    if (!pagePreviewElement) {
      return EMPTY;
    }
    const rendererEl = pagePreviewElement.querySelector(`peb-renderer`);
    const pageDOM = rendererEl.shadowRoot.querySelector('peb-element-document').cloneNode(true);

    return this.getDOMScreenshot(pageDOM, pagePreviewElement.clientWidth, pagePreviewElement.clientHeight).pipe(
      switchMap(blob => {
        return this.editorApi.uploadImage(
          PebShopContainer.Images,
          new File([blob], `builder-page-preview-${pebGenerateId()}`),
        );
      }),
      switchMap((image: PebShopImageResponse) => this.store.updatePagePreview(pageId, image.blobName, lastActionId)),
      tap(() => this.cdr.detectChanges()),
      delay(500),
      tap(() => delete this.pagesWithPreviewCapturingInProgress[pageId]),
      takeUntil(this.destroyed$),
    );
  }

  private getDOMScreenshot(DOM: Node, width: number, height: number): Observable<Blob> {
    // TODO move it to dom-to-image library
    const wrapper = this.renderer.createElement('div');
    this.renderer.setStyle(wrapper, 'position', 'absolute');
    this.renderer.setStyle(wrapper, 'width', `${width}px`);
    this.renderer.setStyle(wrapper, 'height', `${height}px`);
    this.renderer.setStyle(wrapper, 'top', `-${height}px`);
    this.renderer.setStyle(wrapper, 'overflow', 'hidden');
    this.renderer.appendChild(wrapper, DOM);
    this.renderer.setStyle(DOM, 'width', '100%');
    this.renderer.setStyle(DOM, 'height', '100%');
    this.renderer.appendChild(document.body, wrapper);
    return from(toBlob(DOM as HTMLElement, {
      cacheBust: true,
      skipFonts: true,
      width,
      height,
    }).then((blob: Blob) => {
      this.renderer.removeChild(document.body, wrapper);
      return blob;
    }).catch(() => {
      this.renderer.removeChild(document.body, wrapper);
      return null;
    })) as Observable<Blob>;
  }
}
