import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injector,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { PebElementDef } from '@pe/builder-core';
import { PebContext, PebPageId, PebPageType, PebPageVariant, PebStylesheet, PebTemplate } from '@pe/builder-core';

import { PebEditorToolbarComponent } from '../toolbar/toolbar.component';
import { PebAbstractMaker } from '../makers/abstract-maker';
import { ElementManipulation, SectionManipulation } from '../behaviors/general/element-manipulation.behavior';

export interface PageSnapshot {
  id: PebPageId;
  name: string;
  variant: PebPageVariant;
  type: PebPageType;
  data: {
    url?: string;
    mark?: string;
    preview?: string;
  };
  template: PebTemplate;
  stylesheet: PebStylesheet;
  context: PebContext;
}

export abstract class PebAbstractEditor {
  contentPaddings = {
    vertical: 0,
    horizontal: 0,
  };

  contentContainer: ElementRef;

  contentContainerSlot: ViewContainerRef;

  toolbar: PebEditorToolbarComponent;

  sidebarSlot: ViewContainerRef;

  readonly cdr: ChangeDetectorRef;

  /** @deprecated */
  modifiedElement$: BehaviorSubject<{
    id: string,
    cmpRef: ComponentRef<PebAbstractMaker>,
  }>

  /** @deprecated */
  readonly cfr: ComponentFactoryResolver;

  /** @deprecated */
  readonly injector: Injector;

  readonly abstract activePageSnapshot$: Observable<PageSnapshot>;

  readonly manipulateElementSubject$: Subject<ElementManipulation>;
  readonly manipulateElement$: Observable<ElementManipulation>;

  readonly manipulateSectionSubject$: Subject<SectionManipulation>;
  readonly manipulateSection$: Observable<SectionManipulation>;

  abstract get nativeElement(): HTMLElement;

  abstract refreshContext(): void;

  abstract openSidebar<T>(cmpClass: Type<T>): ComponentRef<T>;

  abstract createControl<T>(controlCmp: Type<T>): ComponentRef<T>;

  abstract getNewElementParent(): PebElementDef;


  /** @deprecated */
  abstract openProductsDialog(selectedProducts: string[]): Observable<string[]>;

  abstract openCategoriesDialog(categories, selectedCategories: string[]): Observable<string[]>
}
