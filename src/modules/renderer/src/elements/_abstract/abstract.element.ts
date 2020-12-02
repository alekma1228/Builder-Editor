import {
  ChangeDetectorRef, Component,
  ElementRef, EventEmitter, HostBinding, HostListener,
  Inject,
  Injector,
  Input,
  QueryList, ViewChild,
  ViewChildren, ViewContainerRef,
} from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { Output, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { camelCase, isArray, pickBy, range } from 'lodash';
import { Subject } from 'rxjs';
import { AnimationBuilder } from '@angular/animations';

import {
  PebElementContext,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebInteraction,
  PebInteractionWithPayload,
} from '@pe/builder-core';

import { ElementIdAttribute, PebRendererOptions } from '../../renderer.types';
import { GetParentComponentFunction, RendererGetParentFunction, RendererInteractionEmitter } from '../../renderer.tokens';
import { PebRendererChildrenSlotDirective } from '../../selectors/children-slot.directive';

import { detailedDiff } from 'deep-object-diff';

@Component({ template: '' })
export abstract class PebAbstractElement implements OnInit, OnDestroy {
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() context: PebElementContext<any>;

  @Output() changed = new EventEmitter<any>();

  @Input() options: PebRendererOptions;

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('CONTROLS', { read: ViewContainerRef })
  controlsSlot: ViewContainerRef = null;

  @ViewChildren(PebRendererChildrenSlotDirective)
  childSlots: QueryList<PebRendererChildrenSlotDirective>;

  constructor(
    @Inject(RendererGetParentFunction) private getParent: GetParentComponentFunction,
    @Inject(RendererInteractionEmitter)
    private interactionEmitter: EventEmitter<PebInteraction | PebInteractionWithPayload<any>>,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public injector: Injector,
    public sanitizer: DomSanitizer,
    // TODO: figure out why can't inject it inside Elements
    public animationBuilder: AnimationBuilder,

    // dev
    public cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // this.checkRequiredStyles();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get parent() {
    return this.getParent(this);
  }

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  get isParent(): boolean {
    return [
      PebElementType.Document,
      PebElementType.Section,
      PebElementType.Block,
    ].includes(this.element.type);
  }

  get contentContainer(): HTMLElement {
    return this.nativeElement;
  }

  get potentialContainer(): HTMLElement {
    return null;
  }

  protected abstract get elements(): { [key: string]: HTMLElement | HTMLElement[]};

  protected abstract get mappedStyles(): any;

  applyStyles() {
    if (!this.elements) {
      console.warn('Invalid element component. Missing "elements()" declaration');
      debugger; // tslint:disable-line:no-debugger
      return
    }

    Object
      .entries(this.elements)
      .forEach(([name, element]) => {
        if (!element) {
          // TODO: add logs if there is no mapped styles for an element
          return
        }
        const nextStyles = pickBy(
          this.mappedStyles && this.mappedStyles[name] ? this.mappedStyles[name] : {},
          (val) => val === 0 || !!val,
        );
        const elementsArr = isArray(element) ? element : [element];

        elementsArr.forEach(node => {
          const prevStyles = getStylesMap(node);
          const styleChanges = detailedDiff(prevStyles, nextStyles) as any;

          Object.keys(styleChanges.deleted).forEach(
            (prop) => node.style[prop] = null,
          );

          // TODO: Unfortunately with current implementation order of style definition is important
          //       We should update abstractElement.mappedstyles() so it would it would always produce
          //          predictable StylesMap
          Object.entries(nextStyles)
            .filter(([prop]) => styleChanges.added[prop] || styleChanges.updated[prop])
            .forEach(
              ([prop, value]) => this.renderer.setStyle(node, prop, value),
            );
        });
      });

    // dev
    if (this.element.data?.devGrid) {
      const scale = this.options.scale;
      const step = +this.element.data.devGridStep || 50;
      const devStyles = {
        backgroundColor: '#f8f8f8',
        backgroundImage: 'linear-gradient(to right, rgba(194, 194, 194, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(194, 194, 194, 0.2) 1px, transparent 1px)',
        backgroundSize: `${step * scale}px ${step * scale}px, ${step * scale}px ${step * scale}px`,
        backgroundPosition: '-1px -1px, -1px -1px',
      }

      const gridNode = this.contentContainer;
      Object.entries(devStyles).forEach(([key, value]) => {
        this.renderer.setStyle(gridNode, key, value);
      })
    }
  }

  interact<P>(interaction: PebInteraction | PebInteractionWithPayload<P>) {
    this.interactionEmitter.emit(interaction);
  }

  @HostBinding(`attr.${ElementIdAttribute}`)
  get attrElementId() {
    return this.element.id;
  }

  private checkRequiredStyles() {
    const requiredStyles = {
      [PebElementType.Block]: ['width', 'height'],
      [PebElementType.Image]: ['width', 'height'],
      [PebElementType.Text]: ['width', 'height'],
      [PebElementType.Cart]: ['width', 'height'],
      [PebElementType.Logo]: ['width', 'height'],
      [PebElementType.Menu]: ['width', 'height'],
    };

    if (!requiredStyles[this.element.type]) {
      return;
    }

    requiredStyles[this.element.type].forEach(property => {
      if (!this.styles[property]) {
        console.warn(`
          There is no required property "${property}" in element
          id: ${this.element.id}
          type: ${this.element.type}
        `);
      }
    });
  }
}

// FIXME(@ng-packagr/ng-packagr/issues/710): Remove compile warnings
const HIDE_WARNINGS = {
  HostBinding,
  HostListener,
  QueryList,
};

function getStylesMap(node: HTMLElement) {
  return Object.assign({}, ...range(0, node.style.length)
    .map(i => node.style[i])
    .map(prop => ({ [camelCase(prop)]: node.style[prop] })),
  );
}
