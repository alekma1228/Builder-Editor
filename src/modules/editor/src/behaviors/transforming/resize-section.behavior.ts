import { Inject, Injectable } from '@angular/core';
import { interval, merge, Observable, of, timer } from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mapTo,
  repeat,
  scan,
  skip,
  switchMap,
  switchMapTo,
  take,
  takeLast,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { cloneDeep, merge as lodashMerge } from 'lodash';

import { pebCreateLogger, PebElementId, PebElementStyles, PebElementType } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { filterAnd, filterNot, MouseKey, onlyMouseKeyFilter } from '../_utils/filters';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../services/editor.behaviors';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorState } from '../../services/editor.state';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorStore } from '../../services/editor.store';
import { Axis, PebEditorElement } from '../../renderer/editor-element';
import { PebDOMRect } from '../../editor.typings';
import { AnchorType } from '../../controls/element-anchors/element-anchors.control';
import {
  adaptGridAreas,
  axisEventProps,
  axisSizeProps,
  getGridStyles,
  getMinDimensions,
  setOffsetForAxis,
  setSizeForAxis,
} from './resizing-utils';
import { KeyMap } from './resize-with-keyboard.behavior';

interface ResizeTick {
  state: {
    resizingElement: PebEditorElement;
    anchorType: AnchorType;
    initialScrollTop?: number;
    initialRect?: PebDOMRect;
    initialGridStyles?: PebElementStyles;
    initialStyles?: PebElementStyles;
    initialTopOffsets?: { [childId in PebElementId]: number };
    minHeight?: number;
    invalidPosition?: boolean;
  };
  diff: number;
  count?: number;
  keyboardEvent?: KeyboardEvent,
}

const { Vertical } = Axis;

const log = pebCreateLogger('editor:behaviors:resize-with-mouse');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorResizeSection implements PebEditorBehaviourAbstract {
  constructor(
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
    private store: PebEditorStore,
    @Inject(PEB_EDITOR_EVENTS) private events: PebEditorEvents,
  ) {}

  init(): Observable<any> {
    return merge(
      this.resizeByMouse(),
      this.state.singleSelectedElement$.pipe(
        filter(selectedId => {
          const component = this.renderer.getElementComponent(selectedId);
          if (!component) {
            // display: none
            return false;
          }
          return component.definition.type === PebElementType.Section;
        }),
        switchMapTo(merge(
          this.resizeOnKeyboardClick(),
          this.resizeOnKeyboardHold(),
        )),
      ),
    );
  }

  private resizeOnKeyboardClick() {
    return this.events.window.keydown$.pipe(
      filter(downEvt => !downEvt.repeat),
      switchMap(downEvt => this.events.window.keyup$.pipe(
        filter(upEvt => upEvt.code === downEvt.code),
        takeUntil(timer(399)),
      )),
      filter(filterAnd((evt: KeyboardEvent) => {
        const resizingElement =  this.renderer.getElementComponent(this.state.selectedElements[0]);
        return evt.shiftKey && Object.keys(KeyMap).includes(evt.code) && KeyMap[evt.code].axis === Vertical &&
        resizingElement.definition.type === PebElementType.Section;
      })),
      map((keyboardEvent: KeyboardEvent): ResizeTick => {
        const state = {
          resizingElement: this.renderer.getElementComponent(this.state.selectedElements[0]),
          anchorType: AnchorType.BottomCenter,
          initialScrollTop: this.editor.contentContainer.nativeElement.scrollTop,
        };
        const diff = KeyMap[keyboardEvent.code].delta;
        return { state, diff };
      }),
      tap(this.resizeInitHandler),
      tap(this.resizeInProgressHandler),
      debounceTime(300),
      switchMap(this.resizeCompleteHandler),
    );
  }

  resizeOnKeyboardHold() {
    let resizeInProgress = false;

    return this.events.window.keydown$.pipe(
      distinctUntilChanged((a, b) => resizeInProgress),
      filter(filterAnd((evt: KeyboardEvent) => {
        const resizingElement =  this.renderer.getElementComponent(this.state.selectedElements[0]);
        return evt.shiftKey
          && Object.keys(KeyMap).includes(evt.code)
          && KeyMap[evt.code].axis === Vertical
          && resizingElement.definition.type === PebElementType.Section;
      })),
      map((keyboardEvent: KeyboardEvent): ResizeTick => {
        const state = {
          resizingElement: this.renderer.getElementComponent(this.state.selectedElements[0]),
          anchorType: AnchorType.BottomCenter,
          initialScrollTop: this.editor.contentContainer.nativeElement.scrollTop,
        };
        return { state, diff: 0, count: 0, keyboardEvent };
      }),
      tap(this.resizeInitHandler),
      switchMap((tick) => {
        resizeInProgress = true;

        const flow$ = of(tick).pipe(
          switchMap((resize) => merge(
            of(resize).pipe(
              delay(400),
              switchMapTo(interval(50).pipe(mapTo(resize))),
            ),
          )),
          scan((acc, resizeTick) => {
            resizeTick.count = acc.count + 1;
            resizeTick.diff = KeyMap[tick.keyboardEvent.code].delta * acc.count;
            return resizeTick;
          }, tick),
          // map(resizeTick => {
          //   count = count + 1;
          //   resizeTick.diff =  (resizeTick.state.anchorType === AnchorType.BottomCenter ? 1 : -1) * Math.ceil(count);
          //   return resizeTick;
          // }),
          tap(this.resizeInProgressHandler),
          finalize(() => {
            resizeInProgress = false;
          }),
          takeUntil(this.events.window.keyup$),
        );

        return merge(
          flow$.pipe(
            takeLast(1),
            switchMap(this.resizeCompleteHandler),
          ),
        );
      }),
      repeat(),
    );
  }

  private resizeByMouse(): Observable<any> {
    return this.events.controls.anchorMousedown$.pipe(
      filter(onlyMouseKeyFilter(MouseKey.Primary)),
      map((startEvent) => {
        const resizeAnchorNode = this.renderer.getResizeAnchorTypeAndElementIdAtEventPoint(startEvent);
        const state = {
          resizingElement: this.renderer.getElementComponent(resizeAnchorNode.attributes['anchor-for'].value),
          anchorType: resizeAnchorNode.attributes['anchor-type'].value,
          initialScrollTop: this.editor.contentContainer.nativeElement.scrollTop,
        };
        return { state, startEvent };
      }),
      filter(({ state }) => state.resizingElement.definition.type === PebElementType.Section),
      switchMap(({ state, startEvent }) => {
        const resize$ = this.events.contentContainer.mousemove$.pipe(
          map((moveEvent): ResizeTick => {
            const diff = Math.ceil(
              (moveEvent[axisEventProps[Vertical]] - startEvent[axisEventProps[Vertical]]) / this.state.scale,
            );
            return { state, diff };
          }),
          takeUntil(merge(
            this.events.contentContainer.mouseup$,
            this.events.contentContainer.mouseleave$,
            this.events.contentContainer.mousedown$.pipe(
              filter(filterNot(onlyMouseKeyFilter(MouseKey.Primary))),
            ),
          )),
        );

        return merge(
          resize$.pipe(
            take(1), // `first` doesn't allow empty sequence
            tap(this.resizeInitHandler),
            tap(this.resizeInProgressHandler),
          ),
          resize$.pipe(
            skip(1),
            tap(this.resizeInProgressHandler),
          ),
          resize$.pipe(
            takeLast(1),
            switchMap(this.resizeCompleteHandler),
          ),
        );
      }),
    );
  }

  private resizeInitHandler = (tick: ResizeTick) => {
    tick.state.initialRect = tick.state.resizingElement.getAbsoluteElementRect();
    tick.state.initialGridStyles = getGridStyles(tick.state.resizingElement.contentContainer, this.state.scale);
    tick.state.initialStyles = cloneDeep(tick.state.resizingElement.styles);
    tick.state.minHeight = tick.state.resizingElement.getMinPossibleDimensions(Vertical);
    if (tick.state.anchorType === AnchorType.TopCenter) {
      tick.state.minHeight = getMinDimensions(
        tick.state.resizingElement,
        tick.state.anchorType,
      ).height || tick.state.minHeight;
    }

    tick.state.initialTopOffsets = {};
    if (tick.state.initialStyles.display === 'grid') {
      tick.state.resizingElement.children.forEach(child => {
        if ((child.styles.gridRow as string)?.split(' ')[0] === '1' || !child.styles.gridRow) {
          tick.state.initialTopOffsets = {
            ...tick.state.initialTopOffsets,
            [child.definition.id]: child.getCalculatedMargins().marginTop,
          }
        }

        if (!child.styles.height && child.getAbsoluteElementRect().height === tick.state.initialRect.height) {
          child.styles = {
            ...child.styles,
            height: tick.state.initialRect.height,
          }
          child.applyStyles();
        }
      });
    } else if (tick.state.resizingElement.children.length > 0) {
      const child = tick.state.resizingElement.children[0];
      tick.state.initialTopOffsets[child.definition.id] = child.getCalculatedMargins().marginTop;
    }
  };

  private resizeInProgressHandler = (tick: ResizeTick) => {
    log('progress');

    const { anchorType, resizingElement, initialRect, initialTopOffsets, minHeight, initialGridStyles } = tick.state;
    const diff = tick.diff;
    const scale = this.state.scale;

    let nextTopOffsets: typeof initialTopOffsets;
    let nextSize: number;

    if (anchorType === AnchorType.BottomCenter) {
      nextSize = initialRect[axisSizeProps[Vertical]] + diff;
      nextTopOffsets = cloneDeep(initialTopOffsets);
      if (nextSize < minHeight) {
        nextSize = minHeight;
      }
    } else if (anchorType === AnchorType.TopCenter) {
      nextSize = initialRect[axisSizeProps[Vertical]] - diff;
      nextTopOffsets = {};
      if (nextSize < minHeight) {
        nextSize = minHeight;
        Object.keys(initialTopOffsets).forEach(childId => {
          nextTopOffsets[childId] = initialTopOffsets[childId] - (initialRect.height - minHeight);
        });
      } else {
        Object.keys(initialTopOffsets).forEach(childId => {
          nextTopOffsets[childId] = initialTopOffsets[childId] - diff;
        });
        this.editor.contentContainer.nativeElement.scrollTo({
          top: tick.state.initialScrollTop - (diff * scale),
        });
      }
    }

    resizingElement.dimensions?.form.setValue({
      ...resizingElement.dimensions.form.value,
      height: nextSize,
    }, { emitEvent: false, onlySelf: true });

    resizingElement.styles = {
      ...resizingElement.styles,
      ...setSizeForAxis(Vertical, nextSize, resizingElement.nativeElement, scale),
      ...(resizingElement.styles.gridTemplateRows && {
        gridTemplateRows: adaptGridAreas(
          nextSize,
          initialGridStyles.gridTemplateRows as string,
          anchorType === AnchorType.BottomCenter,
        ),
      }),
    };
    resizingElement.applyStyles();

    Object.keys(initialTopOffsets).forEach(childId => {
      const child = this.renderer.getElementComponent(childId);
      child.styles = {
        ...child.styles,
        ...setOffsetForAxis(Vertical, child.styles, nextTopOffsets[childId]),
      }
      child.applyStyles();
    });
  }

  private resizeCompleteHandler = (tick: ResizeTick) => {
    const { resizingElement, anchorType, initialTopOffsets, initialGridStyles } = tick.state;
   resizingElement.dimensions?.update();

    const height = resizingElement.dimensions?.form.value.height;
    const changes = {
      [resizingElement.definition.id]: {
        height: resizingElement.dimensions?.form.value.height,
        ...(resizingElement.styles.gridTemplateRows && {
          gridTemplateRows: adaptGridAreas(
            height,
            initialGridStyles.gridTemplateRows as string,
            anchorType === AnchorType.BottomCenter,
          ),
        }),
      },
    };

    let childrenChanges = {};
    resizingElement.children.forEach(child => {

      if (child.styles.height) {
        childrenChanges = lodashMerge(childrenChanges, {
          [child.definition.id]: {
            height: child.styles.height,
          },
        });
      }

      if (child.styles.margin && Object.keys(initialTopOffsets).includes(child.definition.id)) {
        childrenChanges = lodashMerge(childrenChanges, {
          [child.definition.id]: {
            margin: child.styles.margin,
            ...('marginTop' in child.styles ? { marginTop: child.styles.marginTop } : null),
          },
        });
      }
    });

    // FIXME: Follow general behavior flow
    return this.store.updateStyles(this.state.screen, {...changes, ...childrenChanges});
  }
}
