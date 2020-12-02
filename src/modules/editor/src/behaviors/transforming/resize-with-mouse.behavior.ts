import { Inject, Injectable } from '@angular/core';
import { filter, map, skip, switchMap, take, takeLast, takeUntil, tap } from 'rxjs/operators';
import { EMPTY, merge, Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

import { pebCreateLogger, PebElementStyles, PebElementType, PebScreen, ScreenWidthList, PebElementId } from '@pe/builder-core';

import { PebEditorBehaviourAbstract } from '../../editor.constants';
import { filterNot, MouseKey, onlyMouseKeyFilter } from '../_utils/filters';
import { PebEditorEvents, PEB_EDITOR_EVENTS } from '../../services/editor.behaviors';
import { PebEditorState } from '../../services/editor.state';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorStore } from '../../services/editor.store';
import { Axis, PebEditorElement } from '../../renderer/editor-element';
import { calculateGrid } from './calculate-grid';
import { PebDOMRect } from '../../editor.typings';
import { AnchorType } from '../../controls/element-anchors/element-anchors.control';
import {
  adaptGridAreas,
  axisEventProps,
  axisMarginProps,
  axisSizeProps,
  getGridStyles,
  getMinDimensions,
  setOffsetForAxis,
  setSizeForAxis,
} from './resizing-utils';
import { PebAbstractEditor } from '../../root/abstract-editor';

interface ResizeTick {
  state: {
    resizingElement: PebEditorElement;
    anchorType: AnchorType;
    initialRect?: PebDOMRect;
    initialStartOffsets?: { [axis in Axis]: number };
    initialStyles?: PebElementStyles;
    initialGridStyles?: PebElementStyles;
    initialChildrenStartOffsets?: { [axis in Axis]: { [childId in PebElementId]: number } };
    minDimensions?: { [axis in Axis]: number };
    maxDimensions?: { [axis in Axis]: number };
    invalidPosition?: boolean;
    axises?: Axis[];
  };
  startEvent: MouseEvent;
  moveEvent: MouseEvent;
}

const { Horizontal, Vertical } = Axis;

const AnchorTypeMap = {
  [AnchorType.TopCenter]: [Vertical],
  [AnchorType.BottomCenter]: [Vertical],
  [AnchorType.MiddleLeft]: [Horizontal],
  [AnchorType.MiddleRight]: [Horizontal],
  [AnchorType.TopLeft]: [Horizontal, Vertical],
  [AnchorType.TopRight]: [Horizontal, Vertical],
  [AnchorType.BottomLeft]: [Horizontal, Vertical],
  [AnchorType.BottomRight]: [Horizontal, Vertical],
};

const log = pebCreateLogger('editor:behaviors:resize-with-mouse');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorResizeWithMouse implements PebEditorBehaviourAbstract {
  constructor(
    private state: PebEditorState,
    private editor: PebAbstractEditor,
    private renderer: PebEditorRenderer,
    private store: PebEditorStore,
    @Inject(PEB_EDITOR_EVENTS) private events: PebEditorEvents,
  ) {}

  init(): Observable<any> {
    return this.events.controls.anchorMousedown$.pipe(
      filter(onlyMouseKeyFilter(MouseKey.Primary)),
      map((startEvent) => {
        const resizeAnchorNode = this.renderer.getResizeAnchorTypeAndElementIdAtEventPoint(startEvent);
        const state = {
          resizingElement: this.renderer.getElementComponent(resizeAnchorNode.attributes['anchor-for'].value),
          anchorType: resizeAnchorNode.attributes['anchor-type'].value,
        };
        return { state, startEvent };
      }),
      filter(({ state }) => ![
        PebElementType.Document,
        PebElementType.Section,
      ].includes(state.resizingElement.definition.type)),
      switchMap(({ state, startEvent }) => {
        const resize$ = this.events.contentContainer.mousemove$.pipe(
          map((moveEvent): ResizeTick => ({ state, startEvent, moveEvent })),
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
    const scale = this.state.scale;

    tick.state.initialRect = tick.state.resizingElement.getAbsoluteElementRect();
    tick.state.initialGridStyles = getGridStyles(tick.state.resizingElement.nativeElement, scale);
    const initialMargins = tick.state.resizingElement.getCalculatedMargins();
    tick.state.initialStartOffsets = {
      [Horizontal]: initialMargins[axisMarginProps[Horizontal]],
      [Vertical]: initialMargins[axisMarginProps[Vertical]],
    };
    tick.state.initialStyles = cloneDeep(tick.state.resizingElement.styles);
    const minDimensions = getMinDimensions(tick.state.resizingElement, tick.state.anchorType);
    tick.state.minDimensions = {
      [Horizontal]: minDimensions.width,
      [Vertical]: minDimensions.height,
    }
    tick.state.maxDimensions = {
      [Horizontal]: tick.state.resizingElement.getMaxPossibleDimensions(Horizontal).size,
      [Vertical]: tick.state.resizingElement.getMaxPossibleDimensions(Vertical).size,
    }
    tick.state.axises = AnchorTypeMap[tick.state.anchorType];

    tick.state.initialChildrenStartOffsets = {
      [Vertical]: {},
      [Horizontal]: {},
    };
    if (tick.state.initialStyles.display === 'grid') {
      const firstRowHeight = parseInt((tick.state.initialGridStyles.gridTemplateRows as string).split(' ')[0], 10);
      const firstColumnWidth = parseInt((tick.state.initialGridStyles.gridTemplateColumns as string).split(' ')[0], 10);
      tick.state.resizingElement.children.forEach(child => {
        const childTopOffset = child.nativeElement.offsetTop / scale;
        if (child.getAbsoluteElementRect().height + childTopOffset <= firstRowHeight) {
          tick.state.initialChildrenStartOffsets[Vertical] = {
            ...tick.state.initialChildrenStartOffsets[Vertical],
            [child.definition.id]: childTopOffset,
          }
        }
        const childLeftOffset = child.nativeElement.offsetLeft / scale;
        if (child.getAbsoluteElementRect().width + childLeftOffset <= firstColumnWidth) {
          tick.state.initialChildrenStartOffsets[Horizontal] = {
            ...tick.state.initialChildrenStartOffsets[Horizontal],
            [child.definition.id]: childLeftOffset,
          }
        }
      });
    } else if (tick.state.resizingElement.children.length > 0) {
      const child = tick.state.resizingElement.children[0];
      tick.state.initialChildrenStartOffsets = {
        [Horizontal]: {
          [child.definition.id]: child.getCalculatedMargins()[axisMarginProps[Horizontal]],
        },
        [Vertical]: {
          [child.definition.id]: child.getCalculatedMargins()[axisMarginProps[Vertical]],
        },
      }
    }
  };

  private resizeInProgressHandler = (tick: ResizeTick) => {
    log('progress');

    tick.state.invalidPosition = !this.validatePosition(tick);

    const {
      resizingElement,
      initialRect,
      axises,
      anchorType,
      initialStartOffsets,
      initialGridStyles,
      initialChildrenStartOffsets,
      minDimensions,
      maxDimensions,
    } = tick.state;
    const scale = this.state.scale;

    const diff = {};
    const nextStartOffset = {};
    const nextSize = {};
    const nextChildrenStartOffsets: typeof initialChildrenStartOffsets = {
      [Vertical]: {},
      [Horizontal]: {},
    };

    axises.forEach(axis => {
      const initialAxisSize = initialRect[axisSizeProps[axis]];
      // Convert diff to 100% scale because we are storing elements properties for this scale and
      // we should update them in this scale too
      diff[axis] = Math.ceil(tick.moveEvent[axisEventProps[axis]] - tick.startEvent[axisEventProps[axis]]) / scale;

      nextStartOffset[axis] = initialStartOffsets[axis];
      if (
        [AnchorType.MiddleRight, AnchorType.BottomCenter, AnchorType.BottomRight].includes(anchorType) ||
        (AnchorType.TopRight === anchorType && axis === Horizontal) ||
        (AnchorType.BottomLeft === anchorType && axis === Vertical)
      ) {
        if ((initialAxisSize + diff[axis]) < minDimensions[axis]) {
          nextSize[axis] = minDimensions[axis];
        } else if ((initialAxisSize + diff[axis]) > maxDimensions[axis]) {
          nextSize[axis] = maxDimensions[axis];
        } else {
          nextSize[axis] = initialAxisSize + diff[axis];
        }
      } else if (
        [AnchorType.TopLeft, AnchorType.TopCenter, AnchorType.MiddleLeft].includes(anchorType) ||
        (AnchorType.TopRight === anchorType && axis === Vertical) ||
        (AnchorType.BottomLeft === anchorType && axis === Horizontal)
      ) {
        if (initialAxisSize - diff[axis] < minDimensions[axis]) {
          nextStartOffset[axis] = initialStartOffsets[axis] + initialAxisSize - minDimensions[axis];
          nextSize[axis] = minDimensions[axis];

          Object.keys(initialChildrenStartOffsets[axis]).forEach(childId => {
            nextChildrenStartOffsets[axis] = {
              ...nextChildrenStartOffsets[axis],
              [childId]: initialChildrenStartOffsets[axis][childId] - (initialAxisSize - minDimensions[axis]),
            };
          });
        } else if ((initialAxisSize - diff[axis]) > maxDimensions[axis]) {
          nextStartOffset[axis] = initialStartOffsets[axis] + initialAxisSize - maxDimensions[axis];
          nextSize[axis] = maxDimensions[axis];

          Object.keys(initialChildrenStartOffsets[axis]).forEach(childId => {
            nextChildrenStartOffsets[axis] = {
              ...nextChildrenStartOffsets[axis],
              [childId]: initialChildrenStartOffsets[axis][childId] - (initialAxisSize - maxDimensions[axis]),
            };
          });
        } else {
          nextStartOffset[axis] = initialStartOffsets[axis] + diff[axis];
          nextSize[axis] = initialAxisSize - diff[axis];

          Object.keys(initialChildrenStartOffsets[axis]).forEach(childId => {
            nextChildrenStartOffsets[axis] = {
              ...nextChildrenStartOffsets[axis],
              [childId]: initialChildrenStartOffsets[axis][childId] - diff[axis],
            };
          });
        }
      }
    });

    resizingElement.dimensions?.form.setValue({
      ...resizingElement.dimensions.form.value,
      ...axises.reduce((acc, axis) => { acc[axisSizeProps[axis]] = nextSize[axis]; return acc; }, {}),
    }, { emitEvent: false, onlySelf: true });

    resizingElement.proportionDimensions?.form.setValue({
      ...resizingElement.proportionDimensions.form.value,
      ...axises.reduce((acc, axis) => { acc[axisSizeProps[axis]] = nextSize[axis]; return acc; }, {}),
    }, { emitEvent: false, onlySelf: true });

    axises.forEach(axis => {
      const adaptLastArea = (
        axis === Vertical && [
          AnchorType.BottomLeft,
          AnchorType.BottomCenter,
          AnchorType.BottomRight,
        ].includes(anchorType)
      ) || (
        axis === Horizontal && [
          AnchorType.TopRight,
          AnchorType.MiddleRight,
          AnchorType.BottomRight,
        ].includes(anchorType)
      );

      resizingElement.styles = {
        ...resizingElement.styles,
        ...setSizeForAxis(axis, nextSize[axis], resizingElement.nativeElement, scale),
        ...setOffsetForAxis(axis, resizingElement.styles, nextStartOffset[axis]),
        ...(axis === Vertical && resizingElement.styles.gridTemplateRows && {
          gridTemplateRows: adaptGridAreas(
            nextSize[axis],
            initialGridStyles.gridTemplateRows as string,
            adaptLastArea,
          ),
        }),
        ...(axis === Horizontal && resizingElement.styles.gridTemplateColumns && {
          gridTemplateColumns: adaptGridAreas(
            nextSize[axis],
            initialGridStyles.gridTemplateColumns as string,
            adaptLastArea,
          ),
        }),
      };
      Object.keys(nextChildrenStartOffsets[axis]).forEach(childId => {
        const child = this.renderer.getElementComponent(childId);
        child.styles = {
          ...child.styles,
          ...setOffsetForAxis(axis, child.styles, nextChildrenStartOffsets[axis][childId]),
        }
        child.applyStyles();
      });
    });

    resizingElement.styles = {
      ...resizingElement.styles,
      ...(resizingElement.definition.type === PebElementType.Text ? { minWidth: resizingElement.styles.width } : {}),
      ...(resizingElement.definition.type === PebElementType.Text ? { minHeight: resizingElement.styles.height } : {}),
    };

    resizingElement.applyStyles();

    resizingElement.controls.edges.instance.valid = !tick.state.invalidPosition;
    resizingElement.controls.edges.instance.detectChanges();
  }

  private resizeCompleteHandler = (tick: ResizeTick) => {

    const resizingElement = tick.state.resizingElement;

    resizingElement.dimensions?.update();
    const changes = calculateGrid(resizingElement.parent, resizingElement.parent.children);

    if (tick.state.invalidPosition) {
      resizingElement.controls.edges.instance.valid = true;
      resizingElement.styles = tick.state.initialStyles;
      resizingElement.applyStyles();
      return EMPTY;
    }

    // Apply calculated style changes before calculate changes for children for correct result
    Object.keys(changes).forEach(id => {
      const updatedElement = this.renderer.getElementComponent(id);
      updatedElement.styles = {
        ...updatedElement.styles,
        ...changes[id],
      };
      updatedElement.applyStyles();
    });

    let childrenChanges = {};
    if (resizingElement.children.length) {
      childrenChanges = calculateGrid(resizingElement, resizingElement.children);
    }

    const screen = resizingElement.target.element?.data?.sync ? Object.values(PebScreen) : this.state.screen;
    // FIXME: Follow general behavior flow
    return this.store.updateStyles(screen, { ...changes, ...childrenChanges }, resizingElement.target.options.screen);
  }

  // TODO: duplicated
  private validatePosition(tick: ResizeTick): boolean {
    const { resizingElement } = tick.state;

    const parent = resizingElement.parent;

    const intersectWithNextSiblings = parent.children
      .filter(child => child.definition.id !== resizingElement.definition.id)
      .some(
        (sibling) => this.renderer.elementIntersect(resizingElement, sibling),
      );

    const fullIncludedToNextParent = this.renderer.elementInclude(resizingElement, parent);

    const elementInsideContentContainer = this.renderer.elementInsideContentContainer(resizingElement, parent);
    const isDimensionsFormValid = !resizingElement.dimensions || !resizingElement.dimensions.form.invalid;

    return fullIncludedToNextParent && !intersectWithNextSiblings && elementInsideContentContainer;
  }
}
