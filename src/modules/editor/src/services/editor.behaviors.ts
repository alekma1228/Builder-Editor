import { Inject, Injectable, InjectionToken, Injector, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { combineLatest, fromEvent, merge, Observable, of } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';

import { pebCreateLogger, PebMediaService } from '@pe/builder-core';
import { PebRenderer } from '@pe/builder-renderer';
import { PebEditorApi, PebProductsApi } from '@pe/builder-api';

import { PebAbstractEditor } from '../root/abstract-editor';
import { PebEditorState } from './editor.state';
import { EDITOR_ENABLED_BEHAVIORS, EDITOR_ENABLED_MAKERS } from '../editor.constants';
import { PebEditorStore } from './editor.store';
import { PebEditorRenderer } from '../renderer/editor-renderer';

const log = pebCreateLogger('editor:behaviors');

export const PEB_EDITOR_EVENTS = new InjectionToken<PebEditorEvents>('EDITOR_EVENTS');

export interface PebEditorEvents {
  window: {
    click$: Observable<MouseEvent>;
    dblclick$: Observable<MouseEvent>;
    mousemove$: Observable<MouseEvent>;
    mouseout$: Observable<MouseEvent>;
    mousedown$: Observable<MouseEvent>;
    mouseup$: Observable<MouseEvent>;
    mouseleave$: Observable<MouseEvent>;
    keydown$: Observable<KeyboardEvent>;
    keyup$: Observable<KeyboardEvent>;
  },
  renderer: {
    click$: Observable<MouseEvent>;
    dblclick$: Observable<MouseEvent>;
    mousemove$: Observable<MouseEvent>;
    mouseout$: Observable<MouseEvent>;
    mousedown$: Observable<MouseEvent>;
    mouseup$: Observable<MouseEvent>;
    mouseleave$: Observable<MouseEvent>;
  },
  contentContainer: {
    click$: Observable<MouseEvent>;
    dblclick$: Observable<MouseEvent>;
    mousemove$: Observable<MouseEvent>;
    mouseout$: Observable<MouseEvent>;
    mousedown$: Observable<MouseEvent>;
    mouseup$: Observable<MouseEvent>;
    mouseleave$: Observable<MouseEvent>;
  },
  controls: {
    anchorMousedown$: Observable<MouseEvent>;
  },
}

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviors {
  constructor(
    @Inject(EDITOR_ENABLED_BEHAVIORS) private enabledBehaviors: any[],
    @Inject(EDITOR_ENABLED_MAKERS) private enabledMakers: any[],
    private store: PebEditorStore,
    private state: PebEditorState,
    private zone: NgZone,
    private injector: Injector,
  ) { }

  readonly pageEmpty$ = combineLatest([
    this.store.snapshot$,
    this.store.activePageId$,
  ]).pipe(
    filter(([snapshot, activePageId]) =>
      !snapshot || !activePageId,
    ),
  );

  initEvents(editor: PebAbstractEditor, renderer: PebRenderer): PebEditorEvents {
    const bindOutside = <T>(target, event): Observable<T> => this.zone.runOutsideAngular(
      () => fromEvent(target, event),
    );
    const filterAnchorControlsEvents = (evt: MouseEvent) => {
      return renderer.shadowRoot
        .elementsFromPoint(evt.pageX, evt.pageY)
        .filter((el: HTMLElement) =>
          (el.tagName.toLowerCase() === 'circle' || el.tagName.toLowerCase() === 'svg') && el.classList.contains('anchor'))
        .length > 0;
    };

    const rendererNode = renderer.nativeElement;
    const contentContainerNode = editor.contentContainer.nativeElement;
    const toolbarNode = editor.toolbar.nativeElement;

    return {
      window: {
        click$: bindOutside<MouseEvent>(window, 'click'),
        dblclick$: bindOutside<MouseEvent>(window, 'dblclick'),
        mousemove$: bindOutside<MouseEvent>(window, 'mousemove'),
        mouseout$: bindOutside<MouseEvent>(window, 'mouseout'),
        mousedown$: bindOutside<MouseEvent>(window, 'mousedown'),
        mouseup$: bindOutside<MouseEvent>(window, 'mouseup'),
        mouseleave$: bindOutside<MouseEvent>(window, 'mouseleave'),
        keydown$: bindOutside<KeyboardEvent>(window, 'keydown'),
        keyup$: bindOutside<KeyboardEvent>(window, 'keyup'),
      },
      renderer: {
        click$: bindOutside<MouseEvent>(rendererNode, 'click'),
        dblclick$: bindOutside<MouseEvent>(rendererNode, 'dblclick'),
        mousemove$: bindOutside<MouseEvent>(rendererNode, 'mousemove'),
        mouseout$: bindOutside<MouseEvent>(rendererNode, 'mouseout'),
        mousedown$: bindOutside<MouseEvent>(rendererNode, 'mousedown').pipe(
          filter((evt: MouseEvent) => !filterAnchorControlsEvents(evt)),
        ),
        mouseup$: bindOutside<MouseEvent>(rendererNode, 'mouseup'),
        mouseleave$: bindOutside<MouseEvent>(rendererNode, 'mouseleave'),
      },
      contentContainer: {
        click$: bindOutside<MouseEvent>(contentContainerNode, 'click'),
        dblclick$: bindOutside<MouseEvent>(contentContainerNode, 'dblclick'),
        mousemove$: bindOutside<MouseEvent>(contentContainerNode, 'mousemove'),
        mouseout$: bindOutside<MouseEvent>(contentContainerNode, 'mouseout'),
        mousedown$: bindOutside<MouseEvent>(contentContainerNode, 'mousedown').pipe(
          filter((evt: MouseEvent) => !filterAnchorControlsEvents(evt)),
        ),
        mouseup$: bindOutside<MouseEvent>(contentContainerNode, 'mouseup'),
        mouseleave$: merge(
          bindOutside<MouseEvent>(contentContainerNode, 'mouseleave'),
          bindOutside<MouseEvent>(toolbarNode, 'mouseenter'),
        ),
      },
      controls: {
        anchorMousedown$: bindOutside<MouseEvent>(rendererNode, 'mousedown').pipe(
          filter(filterAnchorControlsEvents),
        ),
      },
    };
  }

  initBehaviours(editor: PebAbstractEditor, renderer: PebRenderer) {
    const behaviourCtors = this.enabledBehaviors;

    const editorRenderer = new PebEditorRenderer(renderer);

    const behaviourInjector = Injector.create({
      name: 'Behaviours Injector',
      parent: null,
      providers: [
        { provide: PEB_EDITOR_EVENTS, useValue: this.initEvents(editor, renderer) },
        { provide: EDITOR_ENABLED_MAKERS, useValue: this.enabledMakers },
        { provide: PebEditorState, useValue: this.state },
        { provide: PebEditorRenderer, useValue: editorRenderer },
        { provide: PebAbstractEditor, useValue: editor },
        { provide: PebEditorStore, useValue: this.store },
        { provide: FormBuilder, useValue: this.injector.get(FormBuilder) },
        { provide: PebEditorApi, useValue: this.injector.get<PebEditorApi>(PebEditorApi) },
        { provide: PebMediaService, useValue: this.injector.get<PebMediaService>(PebMediaService) },
        { provide: PebProductsApi, useValue: this.injector.get<PebProductsApi>(PebProductsApi) },

        ...behaviourCtors.map(ctor => ({
          provide: ctor,
          useClass: ctor,
        })),
      ],
    });

    const behaviourInstances = behaviourCtors.map(
      behaviourCtor => behaviourInjector.get(behaviourCtor),
    );
    const currentPageId = this.store.activePageId;
    log(`Page "${currentPageId}" - initiated`);
    const behaviourObservables = behaviourInstances.map(b => (b as any).init().pipe(
      catchError(err => {
        console.error('Behavior threw error: ', err);

        if (localStorage.getItem('PEB_BEHAVIORS_FATAL_ERRORS')) {
          return of(null);
        }

        this.store.activatePage(currentPageId)
        return of(null);
      }),
    ));

    return merge(
      ...behaviourObservables,
    ).pipe(
      takeUntil(
        merge(
          this.pageEmpty$,
          this.store.destroyed$,
        ),
      ),
      finalize(() => log(`Page "${currentPageId}" - terminated`)),
    );
  }
}
