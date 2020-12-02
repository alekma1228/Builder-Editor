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
  switchMap,
  switchMapTo,
  takeLast,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { pebCreateLogger, PebElementType } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { PebEditorState } from '../../services/editor.state';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorStore } from '../../services/editor.store';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../services/editor.behaviors';
import { Axis } from '../../renderer/editor-element';
import { filterAnd } from '../_utils/filters';
import { calculateGrid } from './calculate-grid';
import { axisSizeProps, setSizeForAxis } from './resizing-utils';

const { Horizontal, Vertical } = Axis;

export const KeyMap = {
  ArrowUp: { delta: 1, axis: Vertical },
  ArrowDown: { delta: -1, axis: Vertical },
  ArrowLeft: { delta: -1, axis: Horizontal },
  ArrowRight: { delta: 1, axis: Horizontal },
};

const InputFieldMap = {
  Width: { delta: 0, axis: Horizontal },
};

const log = pebCreateLogger('editor:behaviors:resize-with-keyboard');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorResizeByKeyboard implements PebEditorBehaviourAbstract {
  constructor(
    private editor: PebAbstractEditor,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
    private store: PebEditorStore,
    @Inject(PEB_EDITOR_EVENTS) private events: PebEditorEvents,
  ) {}


  init(): Observable<any> {
    return this.state.singleSelectedElement$.pipe(
      filter(selectedId => {
        const component = this.renderer.getElementComponent(selectedId);
        if (!component) {
          // display: none
          return false;
        }
        return component.definition.type !== PebElementType.Document && component.definition.type !== PebElementType.Section;
      }),
      switchMapTo(merge(
        this.resizeOnKeyboardClick(),
        this.resizeOnKeyboardHold(),
      )),
    );
  }

  resizeOnKeyboardClick() {
    return this.events.window.keydown$.pipe(
      filter(downEvt => !downEvt.repeat),
      switchMap(downEvt => this.events.window.keyup$.pipe(
        filter(upEvt => upEvt.code === downEvt.code),
        takeUntil(timer(399)),
      )),
      filter(filterAnd((evt: KeyboardEvent) => {
        const resizingElement =  this.renderer.getElementComponent(this.state.selectedElements[0]);
        return resizingElement && resizingElement.definition.type !== PebElementType.Section
          && ((evt.shiftKey && Object.keys(KeyMap).includes(evt.code)) || this.isInputNumericValue(evt));
      })),
      map((evt) => ({ ...this.resizeInitHandler(evt), count: 1 })),
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
        const resizingElement = this.renderer.getElementComponent(this.state.selectedElements[0]);
        return resizingElement && resizingElement.definition.type !== PebElementType.Section &&
          evt.shiftKey && Object.keys(KeyMap).includes(evt.code);
      })),
      switchMap((evt) => {
        resizeInProgress = true;

        const flow$ = of(this.resizeInitHandler(evt)).pipe(
          switchMap((resize) => of(resize).pipe(
            delay(400),
            switchMapTo(interval(50).pipe(mapTo(resize))),
          )),
          scan((acc, config) => ({
            count: acc.count + 1,
            ...config,
          }),  { count: 0 }),
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

  private resizeInitHandler = (evt: KeyboardEvent) => {
    log('initiated');
    const config = KeyMap[evt.code] ?? InputFieldMap.Width;
    const resizingElement = this.renderer.getElementComponent(this.state.selectedElements[0]);

    return {
      ...config,
      resizingElement,
      minDs: resizingElement.getMinPossibleDimensions(config.axis),
      maxDs: resizingElement.getMaxPossibleDimensions(config.axis),
    };
  }

  private resizeInProgressHandler = (resize) => {
    log('progress');
    const resizingElement = resize.resizingElement;
    const elementRect = resizingElement.getAbsoluteElementRect();
    const elementStyles = resizingElement.styles;

    const diff = resize.delta * Math.ceil(resize.count / 10);

    let nextSize = elementRect[axisSizeProps[resize.axis]];

    if (resize.delta > 0) {
      if (elementRect[axisSizeProps[resize.axis]] + diff <= resize.maxDs.size - resize.maxDs.spaceStart
        || resizingElement.definition.type === PebElementType.Section) {
        nextSize = elementRect[axisSizeProps[resize.axis]] + diff;
      }
    } else {
      if (elementRect[axisSizeProps[resize.axis]] > resize.minDs) {
        const subtract = nextSize - Math.max(nextSize - Math.abs(diff), resize.minDs);
        nextSize = nextSize - subtract;
      }
    }
    // Fix position if necassery
    // if (isElementOverflowingContainer(nextStart, nextSize, resize.maxDs.end)) {
    //   nextStart = fixPositionForOverflowingElement(nextStart, nextSize, resize.maxDs.end);
    // }

    resizingElement.dimensions?.form.setValue({
      ...resizingElement.dimensions.form.value,
      [axisSizeProps[resize.axis]]: nextSize,
    },                                        { emitEvent: false, onlySelf: true });

    resizingElement.proportionDimensions?.form.setValue({
      ...resizingElement.proportionDimensions.form.value,
      [axisSizeProps[resize.axis]]: nextSize,
    }, { emitEvent: false, onlySelf: true });

    const nextStyles = {
      ...elementStyles,
      ...setSizeForAxis(resize.axis, nextSize, resizingElement.nativeElement, this.state.scale),
    };

    resizingElement.styles = {
      ...nextStyles,
      ...(resizingElement.definition.type === PebElementType.Text ? { minWidth: nextStyles.width } : {}),
      ...(resizingElement.definition.type === PebElementType.Text ? { minHeight: nextStyles.height } : {}),
    };

    resizingElement.applyStyles();
  }

  private resizeCompleteHandler = (resize) => {
    const resizingElement = resize.resizingElement;

    resizingElement.dimensions?.update();
    resizingElement.proportionDimensions?.update();

    const changes = calculateGrid(resizingElement.parent, resizingElement.parent.children);

    // FIXME: Follow general behavior flow
    return this.store.updateStyles(this.state.screen, changes);
  }

  private isInputNumericValue(event: KeyboardEvent): boolean {
    const isNumber = /^[0-9]$/i.test(event.key);
    const isTargetValid: any = event;
    return isNumber && isTargetValid.target.valueAsNumber > 20;
  }

}
