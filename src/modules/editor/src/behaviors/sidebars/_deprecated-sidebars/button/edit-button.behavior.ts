import { ComponentRef, Inject, Injectable, Injector } from '@angular/core';
import { EMPTY, merge, Observable } from 'rxjs';
import {
  bufferCount,
  debounceTime,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { cloneDeep, merge as lodashMerge } from 'lodash';

import {
  pebCreateLogger,
  PebElementDef,
  PebElementStyles,
  PebElementType,
} from '@pe/builder-core';

import { EDITOR_ENABLED_MAKERS } from '../../../../editor.constants';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebAbstractEditor } from '../../../../root/abstract-editor';
import { PebEditorState } from '../../../../services/editor.state';
import { PebEditorRenderer } from '../../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../../services/editor.store';
import {
  PebEditorEvents,
  PEB_EDITOR_EVENTS,
} from '../../../../services/editor.behaviors';
import { PebEditorButtonSidebarComponent } from './button.sidebar';
import { replaceElementWithMaker } from '../../../_utils/makers';
import { AbstractEditElementWithSidebar } from '../../_sidebar.behavior';

import { diff } from 'deep-object-diff';

export interface Changes {
  [ prop: string ]: any;
}

const styleDefaults = { borderWidth: 1 };
const log = pebCreateLogger('editor:behaviors:edit-image');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditButton extends AbstractEditElementWithSidebar<PebEditorButtonSidebarComponent> {
  static elementTypes = [ PebElementType.Button ];

  sidebarComponent = PebEditorButtonSidebarComponent;

  logger = { log };

  // TODO: move to behaviour state
  changes: Changes = null;
  element: any = null;

  behaviourState: {
    initialElement: { element: PebElementDef; styles: PebElementStyles };
    activeElement: PebEditorElement;
    sidebar: ComponentRef<any>;
    maker: ComponentRef<any>;
  } = {
    initialElement: null,
    activeElement: null,
    sidebar: null,
    maker: null,
  };

  constructor(
    protected editor: PebAbstractEditor,
    protected state: PebEditorState,
    protected renderer: PebEditorRenderer,
    protected store: PebEditorStore,
    injector: Injector,
    @Inject(PEB_EDITOR_EVENTS) protected events: PebEditorEvents,
    @Inject(EDITOR_ENABLED_MAKERS) protected makers: any,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return merge(
      this.singleElementOfTypeSelected$().pipe(
        switchMap((el: PebEditorElement) => {
          if (
            this.behaviourState.activeElement &&
            this.behaviourState.activeElement.definition.id !== el.definition.id
          ) {
            this.destroyMaker();
          }

          this.behaviourState.activeElement = el;

          this.behaviourState.initialElement = {
            element: cloneDeep(this.behaviourState.activeElement.definition),
            styles: lodashMerge(
              {},
              styleDefaults,
              this.behaviourState.activeElement.styles,
            ),
          };

          this.initPositionForm(el);
          this.initDimensionsForm(el);
          this.initBackgroundForm(el);

          const sidebarCmpRef = this.initSidebar(el);

          sidebarCmpRef.instance.element = el.definition;
          sidebarCmpRef.instance.styles = {
            ...el.styles,
          };
          sidebarCmpRef.changeDetectorRef.detectChanges();

          this.behaviourState.sidebar = sidebarCmpRef;

          return merge(
            this.handlePositionForm(el),
            this.handleDimensionsForm(el),
            this.handleBackgroundForm(el, sidebarCmpRef),
            this.editFlow(el, sidebarCmpRef),
          ).pipe(
            takeUntil(this.state.selectionChanged$()),
            finalize(() => sidebarCmpRef.destroy()),
          );
        }),
      ),
      this.doubleClick(),
      this.startTypingWithoutMaker(),
      this.blur$.pipe(switchMap(() => this.destroyMaker())),
    );
  }

  private doubleClick(): Observable<PebEditorElement> {
    return this.events.contentContainer.dblclick$.pipe(
      map((evt: MouseEvent) => {
        const elementCmp = this.renderer.getElementComponentAtEventPoint(evt);
        return this.renderer.registry.get(elementCmp.definition.id);
      }),
      filter(e => !!e && e.definition.type === PebElementType.Button),
      tap(() => {
        window.getSelection().empty();
        this.replaceActiveElementWithMarker();
      }),
    );
  }

  private replaceActiveElementWithMarker() {
    const maker = replaceElementWithMaker(
      this.behaviourState.activeElement,
      this.editor,
      this.renderer,
      this.makers,
      this.behaviourState.sidebar,
      this.state.scale,
    );

    this.behaviourState.maker = maker;
    this.state.makerActive = true;
  }

  private startTypingWithoutMaker(): Observable<any> {
    const letterPressed = (e: KeyboardEvent) =>
      !e.metaKey && !e.ctrlKey && /^[a-zA-Z1-9]$/.test(e.key);

    // process keydown events only if last clicked element was inside of the renderer element
    return this.events.window.click$.pipe(
      map((evt: MouseEvent) => this.renderer.shadowRoot.elementsFromPoint(evt.pageX, evt.pageY)),
      bufferCount(1),
      switchMap((buffer) => {
        return this.events.window.keydown$.pipe(
          map(event => ({
            event,
            element: this.renderer.registry.get(this.state.selectedElements[ 0 ]),
          })),
          filter(
            ({ element, event }) =>
              buffer[ 0 ].filter((el: HTMLElement) => el.nodeName === 'PEB-RENDERER').length > 0 &&
              !!this.behaviourState.activeElement &&
              [ PebElementType.Button ].find(t => element?.definition.type === t) &&
              letterPressed(event) &&
              !this.renderer?.maker,
          ),
          tap(
            ({ event }) => {
              this.behaviourState.activeElement.definition.data.text = event.key;
              this.replaceActiveElementWithMarker();
            }),
        );
      }),
    );
  }

  private get blur$(): Observable<any> {
    return this.state.selectedElements$.pipe(
      map(
        elements => elements?.length && this.renderer.registry.get(elements[ 0 ]),
      ),
      filter(() => !!this.behaviourState.activeElement),
      filter(
        element =>
          element &&
          element.definition.id !==
          this.behaviourState.activeElement.definition.id,
      ),
    );
  }

  // TODO: duplicated code
  private destroyMaker() {
    // TODO: Check
    // if ((this.renderer.maker as any)?.instance?.element.id !== this.behaviourState.activeElement.definition.id) {
    //   return EMPTY;
    // }

    const nextElement = {
      ...this.behaviourState.activeElement.definition,
      data: {
        ...this.behaviourState.activeElement.definition.data,
        text:
          (this.renderer.maker as any)?.instance?.textEditorRef.text ||
          this.behaviourState.activeElement.definition.data.text,
      },
    };

    const nextStyles = {
      ...this.behaviourState.activeElement.styles,
      ...((this.renderer.maker as any)?.instance && {
        ...(this.renderer.maker as any).instance.styles,
      }),
    };

    this.behaviourState.activeElement = null;

    if (this.renderer.maker) {
      this.renderer.cleanMaker();
      this.behaviourState.maker = null;
    }

    this.state.makerActive = false;

    return this.saveChanges({ element: nextElement, styles: nextStyles });
  }

  private saveChanges(params): Observable<any> {
    const { element, styles } = params;
    const nextElement = element ?? {
      ...this.element,
      ...this.behaviourState.activeElement.definition,
      data: {
        ...this.behaviourState.activeElement.definition.data,
        ...(this.element?.data && { ...this.element.data }),
        text:
          (this.renderer.maker as any)?.instance?.textEditorRef.text ||
          this.behaviourState.activeElement.definition.data.text,
      },
      ...(element && { ...element }),
    };
    const nextStyles = styles ?? {
      ...(this.changes && Object.keys(this.changes) && { ...this.changes }),
      ...this.behaviourState.activeElement.styles,
      ...((this.renderer.maker as any)?.instance && {
        ...(this.renderer.maker as any).instance.styles,
      }),
      ...(styles && { ...styles }),
    };
    const initialElement = this.behaviourState.initialElement;
    const elementDiff = diff(initialElement.element, nextElement);
    const stylesDiff = diff(initialElement.styles, {
      ...styleDefaults,
      ...nextStyles,
    });

    if (!Object.keys(elementDiff).length && !Object.keys(stylesDiff).length) {
      return EMPTY;
    }

    this.element = null;
    this.changes = null;

    return this.store.updateElementKit(this.state.screen, nextElement, {
      [ nextElement.id ]: nextStyles,
    });
  }

  private updateElementStyles(element, style) {
    // TODO: Refactor
    if (this.behaviourState.maker) {
      const entries = Object.entries(style)[ 0 ];
      const styleName = entries[ 0 ];

      const forTextEditor = !![
        'fontSize',
        'fontWeight',
        'fontStyle',
        'textDecoration',
        'color',
        'fontFamily',
      ].find(s => styleName === s);

      const styleValue =
        entries[ 1 ] || entries[ 1 ] === 0
          ? isNaN(entries[ 1 ] as number)
          ? entries[ 1 ]
          : forTextEditor
            ? (entries[ 1 ] as number) * this.state.scale + 'px'
            : entries[ 1 ] + 'px'
          : null;

      const target: HTMLElement = forTextEditor
        ? (this.behaviourState.maker.instance.textEditorRef
          .iframeBody as HTMLElement)
        : this.behaviourState.maker.instance.nativeElement;

      target.style[ styleName ] = styleValue;
    }

    element.styles = { ...element.styles, ...style };
  }

  private editFlow(
    el: PebEditorElement,
    sidebar: ComponentRef<PebEditorButtonSidebarComponent>,
  ): Observable<any> {
    return merge(
      sidebar.instance.changeStyle.pipe(
        tap(style => {
          el.styles = { ...el.styles, ...style };
          this.updateElementStyles(el, style);

          sidebar.instance.styles = el.styles;
          sidebar.changeDetectorRef.detectChanges();

          this.changes = { ...this.changes, ...style };
        }),
      ),
      sidebar.instance.changeStyleFinal.pipe(
        debounceTime(500),
        tap(styles => this.saveChanges({ styles })),
      ),
      sidebar.instance.changeElement.pipe(
        tap(element => {
          this.element = element;
          el.definition.data.action = element.data.action;
          this.changes = { ...this.changes };
        }),
      ),
      merge(
        sidebar.instance.changeStyle,
        sidebar.instance.changeElement,
      ).pipe(
        debounceTime(250),
        tap(styles => this.saveChanges({ styles })),
      ),
    ).pipe(
      finalize(() => {
        this.changes = null;

        if (this.renderer.maker) {
          this.renderer.cleanMaker();
          this.behaviourState.maker = null;
        }

        this.state.makerActive = false;
      }),
    );
  }
}
