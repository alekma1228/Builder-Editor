import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY, merge, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  switchMapTo,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { find } from 'lodash';
import { MatDialog } from '@angular/material/dialog';

import { PebElementType, PebEnvService, PebPage, PebPageShort, PebPageVariant, PebShopThemeSnapshot, PebTheme } from '@pe/builder-core';
import { PebEditorApi, PebProductsApi } from '@pe/builder-api';
import { PebRenderer } from '@pe/builder-renderer';
import { PebProductCategoriesComponent, PebProductsComponent } from '@pe/builder-products';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { FontLoaderService } from '@pe/builder-font-loader';

import { ContextBuilder } from '../services/context.service';
import { PebEditorState } from '../services/editor.state';
import { PebEditorBehaviors } from '../services/editor.behaviors';
import { PebEditorStore } from '../services/editor.store';
import { PebEditorToolbarComponent } from '../toolbar/toolbar.component';
import { PebAbstractMaker } from '../makers/abstract-maker';
import { AbstractComponent } from '../misc/abstract.component';
import { PebAbstractEditor } from './abstract-editor';
import { sidebarsAnimations } from './editor.animations';
import { ElementManipulation, SectionManipulation } from '../behaviors/general/element-manipulation.behavior';
import { PebEditorUtilsService } from '../services/editor-utils.service';

@Component({
  selector: 'peb-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [
    PebEditorState,
    PebEditorBehaviors,
    PebEditorStore,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    sidebarsAnimations,
  ],
})
export class PebEditor extends AbstractComponent implements PebAbstractEditor, OnInit, AfterViewInit {
  @Input()
  set data({ theme, snapshot }: { theme: PebTheme, snapshot: PebShopThemeSnapshot }) {
    this.store.openTheme(theme, snapshot, this.queryParams.pageId);
  }

  @ViewChild(PebRenderer)
  set renderer(val: PebRenderer) {
    this.rendererSubject$.next(val);
  }

  @ViewChild('contentContainer')
  contentContainer: ElementRef;

  @ViewChild('contentContainerSlot', { read: ViewContainerRef })
  contentContainerSlot: ViewContainerRef;

  @ViewChild(PebEditorToolbarComponent)
  toolbar: PebEditorToolbarComponent;

  @ViewChild('sidebarSlot', { read: ViewContainerRef })
  public sidebarSlot: ViewContainerRef;

  modifiedElement$ = new BehaviorSubject<{
    id: string,
    cmpRef: ComponentRef<PebAbstractMaker>,
  }>(null);

  readonly rendererSubject$ = new BehaviorSubject<PebRenderer>(null);
  readonly renderer$ = this.rendererSubject$.pipe(distinctUntilChanged());

  get renderer() { // tslint:disable-line:adjacent-overload-signatures
    return this.rendererSubject$.value;
  }

  readonly manipulateElementSubject$: Subject<ElementManipulation> = new Subject();
  readonly manipulateElement$ = this.manipulateElementSubject$.asObservable();

  readonly manipulateSectionSubject$: Subject<SectionManipulation> = new Subject();
  readonly manipulateSection$ = this.manipulateSectionSubject$.asObservable();

  private readonly refreshContextSubject$ = new BehaviorSubject<null>(null);

  // TODO: replace with subject that can have null value
  readonly pages$ = combineLatest([
    this.store.snapshot$.pipe(filter(Boolean)),
    this.state.pagesView$,
  ]).pipe(
    map(([snapshot, pagesView]) => {
      const allPages: PebPageShort[] = Object.values((snapshot as any).pages);
      return allPages.filter(page => page.type === pagesView);
    }),
  );

  readonly activePageSnapshotSubject$ = new BehaviorSubject(null);

  readonly activePageSnapshot$ = this.activePageSnapshotSubject$.asObservable();

  get activePageSnapshot() {
    return this.activePageSnapshotSubject$.value;
  }

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  PebElementType = PebElementType;

  contentPaddings = {
    vertical: 0,
    horizontal: 0,
  };

  constructor(
    private api: PebEditorApi,
    private store: PebEditorStore,
    public state: PebEditorState,
    private contextManager: ContextBuilder,
    public events: PebEditorBehaviors,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private editorUtilsService: PebEditorUtilsService,
    public injector: Injector,                // TODO: Should be private
    public cdr: ChangeDetectorRef,
    public cfr: ComponentFactoryResolver,     // TODO: Should be private
    private envService: PebEnvService,
    private dialog: MatDialog,
    private productsApi: PebProductsApi,
    private elementRef: ElementRef,
    private fontLoaderService: FontLoaderService,
  ) {
    super();
    this.fontLoaderService.renderFontLoader();
    this.editorUtilsService.constructPageSnapshot(
      this.store.snapshot$,
      this.store.activePageId$,
      this.state.screen$,
      this.refreshContextSubject$,
    ).pipe(
      tap(this.activePageSnapshotSubject$),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.store.snapshot$.pipe(
      switchMapTo(this.rendererSubject$),
      filter(renderer => !!renderer),
      switchMap(renderer => renderer.rendered),
      withLatestFrom(this.rendererSubject$, this.state.selectedElements$),
      takeUntil(this.destroyed$),
    )
    .subscribe(([, renderer, selectedElements]) => {
      const elementsFound = selectedElements.filter(id => renderer.registry.get(id));
      if (elementsFound.length < selectedElements.length) {
        this.state.selectedElements = elementsFound;
      }
    });

    (window as any).pebEditor = this;
  }

  get queryParams() {
    return (this.activeRoute.queryParams as any).value;
  }

  ngOnInit() {
    merge(
      this.trackActivePageIdInQuery(),
      this.resetStoreOnPageChange(),
      this.trackActivePageType(),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngAfterViewInit() {
    this.initEvents();
  }

  trackPagesSidebar() {
    return combineLatest([
      this.state.pagesView$,
      this.store.snapshot$.pipe(filter(Boolean)),
    ]).pipe(
      tap(() => {
        this.state.hoveredElement = null;
        this.state.selectedElements = [];
      }),
      switchMap(([pagesView]) =>
        this.store.activateLastPageByView(pagesView),
      ),
    );
  }

  refreshContext() {
    this.refreshContextSubject$.next(null);
  }

  trackActivePageIdInQuery() {
    return combineLatest([
      this.store.snapshot$,
      this.store.activePageId$,
    ]).pipe(
      filter(([snapshot, activePageId]) => !!snapshot && !!activePageId),
      tap(([snapshot, activePageId]) => {
        const activatePage = find(snapshot.pages, page => page.variant === PebPageVariant.Front);
        const pageId = activatePage && activatePage.id !== activePageId ? activePageId : null;

        this.router.navigate(['./'], {
          relativeTo: this.activeRoute,
          queryParamsHandling: 'merge',
          queryParams: { pageId },
        }).then();
      }),
    );
  }

  resetStoreOnPageChange() {
    return this.store.activePageId$.pipe(
      tap(() => {
        this.state.selectedId = null;
        this.state.selectedCmp = null;
        this.state.selectedType = null;
      }),
    );
  }

  trackActivePageType() {
    return combineLatest([
      this.state.pagesView$.pipe(distinctUntilChanged()),
      this.store.snapshot$.pipe(filter(v => Boolean(v))),
      this.store.activePageId$.pipe(filter(v => Boolean(v))),
    ]).pipe(
      filter(([activePageType, snapshot, activePageId]) =>
        snapshot.pages[activePageId] && snapshot.pages[activePageId].type !== activePageType,
      ),
      tap(() => {
        this.state.hoveredElement = null;
        this.state.selectedElements = [];
      }),
      switchMap(([activePageType]) => {
        return this.store.activateLastPageByView(activePageType);
      }),
    );
  }

  initEvents() {
    combineLatest([
      this.renderer$.pipe(filter(r => Boolean(r))),
      this.store.activePageId$.pipe(distinctUntilChanged()),
    ]).pipe(
      switchMap(([renderer, activePageId]) => {
        return activePageId
          ? this.events.initBehaviours(this, renderer)
          : EMPTY;
      }),
    ).subscribe();
  }

  onActivatePage(page: PebPage) {
    this.state.hoveredElement = null;
    this.state.selectedElements = [];
    this.toolbar.toggleSeoSidebar.emit(false);
    this.store.activatePage(page.id).subscribe();
  }

  onCreatePage(input: { type, masterId }) {
    this.toolbar.toggleSeoSidebar.emit(false);
    let maxPageNumber = 0;

    (Object
      .values(this.store.snapshot.pages) as PebPageShort[])
      .filter(page => page.type === input.type)
      .forEach((page) => {
        if (!/^Page ([0-9]+)$/.test(page.name)) {
          return;
        }
        maxPageNumber = Math.max(maxPageNumber, +page.name.replace('Page ', ''));
      });
    this.state.hoveredElement = null;
    this.state.selectedElements = [];
    this.sidebarSlot.clear();
    this.store.createPage({
      name: `Page ${maxPageNumber + 1}`,
      variant: PebPageVariant.Default,
      type: input.type,
      masterId: input.masterId,
    }).subscribe();
  }

  onDuplicatePage(page: PebPageShort) {
    const name = `${page.name} (Duplicate)`;
    this.store.duplicatePage({
      name,
      pageId: page.id,
      pageVariant: page.variant,
    }).subscribe();
  }

  onDeletePage(page: any) {
    this.toolbar.toggleSeoSidebar.emit(false);
    this.state.hoveredElement = null;
    this.state.selectedElements = [];
    this.sidebarSlot.clear();
    this.store.deletePage(page, this.state.pagesView).subscribe();
  }

  onOpenPreview() {
    this.dialog.open(PebViewerPreviewDialog, {
      position: {
        top: '0',
        left: '0',
      },
      height: '100vh',
      maxWidth: '100vw',
      width: '100vw',
      panelClass: 'themes-preview-dialog',
      data: {
        themeSnapshot: this.store.snapshot,
      },
    });
  }

  getNewElementParent() {
    const selIds = this.state.selectedElements;

    // if no element has been selected we append to first section
    if (!selIds.length) {
      return this.activePageSnapshot.template.children[0];
    }

    if (selIds.length > 1) {
      alert('You should have only one selected element to insert new element');
      return null;
    }

    // TODO: Do it without traversing through renderer.elements
    let parentCmp = this.renderer.registry.get(selIds[0]);
    while (!parentCmp.potentialContainer && !parentCmp.isParent) {
      parentCmp = parentCmp.parent;
    }

    return parentCmp.element;
  }

  openSidebar<T>(cmpClass: Type<T>): ComponentRef<T> {
    // TODO: Find a way to destroy from behaviour
    const prevSidebar = this.sidebarSlot.get(0);
    if (prevSidebar && !prevSidebar.destroyed) {
      prevSidebar.destroy();
    }

    this.sidebarSlot.clear();
    const sidebarFactory = this.cfr.resolveComponentFactory(cmpClass);
    const sidebarRef = sidebarFactory.create(this.injector);
    this.sidebarSlot.insert(sidebarRef.hostView);

    return sidebarRef;
  }

  createControl<T>(controlClass: Type<T>): ComponentRef<T> {
    const injector = Injector.create({
      name: 'Controls injector',
      parent: this.injector,
      providers: [
        { provide: PebAbstractEditor, useValue: this },
      ],
    });

    return this.cfr
      .resolveComponentFactory(controlClass)
      .create(injector);
  }


  // TODO: move to products behaviour
  openProductsDialog(selectedProducts: string[]) {
    return this.productsApi.getProducts().pipe(
      // TODO: add Product interface
      map(products =>
        products.map(product => ({
          ...product,
          image: product.images[0] || '',
          subtitle: `${product.currency} ${product.price}`,
          description: 'In Stock',
        })),
      ),
      switchMap((products) => {
        const dialog = this.dialog.open(PebProductsComponent, {
          position: {
            top: '0',
            left: '0',
          },
          height: '100vh',
          maxWidth: '100vw',
          width: '100vw',
          panelClass: 'products-dialog',
          data: {
            products,
            selectedProducts,
          },
        });
        return dialog.afterClosed();
      }),
    );
  }

  openCategoriesDialog(categories, selectedCategories: string[]): Observable<string[]> {
    const dialog = this.dialog.open(PebProductCategoriesComponent, {
      position: {
        top: '0',
        left: '0',
      },
      height: '100vh',
      maxWidth: '100vw',
      width: '100vw',
      panelClass: 'products-dialog',
      data: {
        categories,
        selectedCategories,
      },
    });
    return dialog.afterClosed();
  }

  onChangeElementVisible({ element, visible }) {
    const display = visible
      ? element.children?.length
        ? 'grid'
        : 'flex'
      : 'none';

    return this.store.updateStyles(this.state.screen, {
      [element.id]: { display },
    });
  }

  @HostListener('window:keydown.alt.Escape')
  onClosePage() {
    this.state.hoveredElement = null;
    this.state.selectedElements = [];
    this.store.activatePage(null).subscribe();
  }

  @HostListener('window:keydown.control.z')
  @HostListener('window:keydown.meta.z')
  onUndo() {
    if (this.state.makerActive || ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
      return;
    }
    this.store.undoAction();
  }

  @HostListener('window:keydown.control.shift.z')
  @HostListener('window:keydown.meta.shift.z')
  onRedo() {
    if (this.state.makerActive || ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
      return;
    }
    this.store.redoAction();
  }

  // TODO: This should be placed inside element-manipulation.behavior
  @HostListener('window:keydown.backspace')
  @HostListener('window:keydown.delete')
  deleteElement() {
    if (this.state.makerActive || ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
      return;
    }
    this.manipulateElementSubject$.next({
      selectedElements: this.state.selectedElements,
      type: 'delete',
      screen: this.state.screen,
    });
  }

  @HostListener('window:keydown.control.c')
  @HostListener('window:keydown.meta.c')
  copyElement() {
    if (this.state.makerActive || ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
      return;
    }

    // Save element in store
    this.manipulateElementSubject$.next({
      selectedElements: this.state.selectedElements,
      type: 'copy',
    });
  }

  @HostListener('window:keydown.control.v')
  @HostListener('window:keydown.meta.v')
  pasteElement() {
    if (this.state.makerActive || ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
      return;
    }

    // Paste element in active element
    this.manipulateElementSubject$.next({
      type: 'paste',
      screen: this.state.screen,
    });
  }
}
