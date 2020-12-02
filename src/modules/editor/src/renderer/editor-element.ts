import { ComponentRef, ViewContainerRef } from '@angular/core';

import { PebAbstractElement, PebButtonElement, PebTextElement } from '@pe/builder-renderer';
import { PebElementType, PEB_DESKTOP_CONTENT_WIDTH } from '@pe/builder-core';

import { MaxPossibleDimensions, PebDOMRect, PebMargins } from '../editor.typings';
import { PebEditorRenderer } from './editor-renderer';
import { PebEditorElementCoordsControl } from '../controls/element-coords/element-coords.control';
import { PebEditorElementEdgesControl } from '../controls/element-edges/element-edges.control';
import { PebEditorElementAnchorsControl } from '../controls/element-anchors/element-anchors.control';
import { PebEditorSectionLabelsControl } from '../controls/section-labels/section-labels.control';
import {
  PebEditorElementPropertyBackground,
  PebEditorElementPropertyBorder,
  PebEditorElementPropertyCategory,
  PebEditorElementPropertyDimensions,
  PebEditorElementPropertyFont,
  PebEditorElementPropertyOpacity,
  PebEditorElementPropertyPosition,
  PebEditorElementPropertyProportions,
  PebEditorElementPropertyShadow,
} from './interfaces';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

export enum Axis {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

// TODO: move to PebEditorVideoElement
export enum VideoSourceType {
  MyVideo = 'my-video',
  Link = 'link',
}

export enum VideoSubTab {
  Media = 'media',
  Details = 'details',
}

const { Horizontal, Vertical } = Axis

// questionable naming. opposite? collinear?
export const AxisOpposite = {
  [Axis.Horizontal]: Axis.Vertical,
  [Axis.Vertical]: Axis.Horizontal,
};

export const AxisProps = {
  [Axis.Horizontal]: {
    start: 'left',
    size: 'width',
    end: 'right',
  },
  [Axis.Vertical]: {
    start: 'top',
    size: 'height',
    end: 'bottom',
  },
};

export const getAxisRectStart = (axis, rect) => {
  const startProp = {
    [Vertical]: 'top',
    [Horizontal]: 'left',
  }[axis];
  return rect[startProp];
};

export const getAxisRectEnd = (axis, rect) => {
  const endProp = {
    [Vertical]: 'bottom',
    [Horizontal]: 'right',
  }[axis];
  return rect[endProp];
};

export const pointInRect = (
  rect: { left: number, top: number, bottom: number, right: number},
  point: { x: number, y: number },
): boolean => {
  return point.x >= rect.left
    && point.x <= rect.right
    && point.y >= rect.top
    && point.y <= rect.bottom;
};

export class PebEditorElement {
  controls: {
    edges?: ComponentRef<PebEditorElementEdgesControl>
    anchors?: ComponentRef<PebEditorElementAnchorsControl>,
    coords?: ComponentRef<PebEditorElementCoordsControl>,
    labels?: ComponentRef<PebEditorSectionLabelsControl>,
  } = {};

  // TODO: move to PebEditorElementPropertyProportionDimensions
  proportionDimensions?: {
    initialValue: { width: number, height: number, constrainProportions?: boolean, proportionRatio?: number },
    form: FormGroup,
    limits: {
      width: BehaviorSubject<{ min: number, max: number }>,
      height: BehaviorSubject<{ min: number, max: number }>,
    },
    activate: () => void,
    update: () => void,
    submit: Subject<any>,
  };

  position?: PebEditorElementPropertyPosition;
  dimensions?: PebEditorElementPropertyDimensions;
  opacity?: PebEditorElementPropertyOpacity;
  background?: PebEditorElementPropertyBackground;
  font?: PebEditorElementPropertyFont;
  proportions?: PebEditorElementPropertyProportions;
  shadow?: PebEditorElementPropertyShadow;
  productDimensions?: PebEditorElementPropertyDimensions;
  border?: PebEditorElementPropertyBorder;
  categories?: PebEditorElementPropertyCategory;

  constructor(
    private renderer: PebEditorRenderer,
    public target: PebAbstractElement,
  ) {
    if (!target || !target.element) {
      debugger;
    }
  }

  get isParent(): boolean {
    return this.target.isParent;
  }

  get definition() {
    return this.target.element;
  }

  get styles() {
    return this.target.styles;
  }

  set styles(styles) {
    this.target.styles = styles;

    this.target.applyStyles();
  }

  get options() {
    return this.target.options;
  }

  get context() {
    return this.target.context;
  }

  get nativeElement(): HTMLElement {
    return this.target.nativeElement;
  }

  get parent(): PebEditorElement {
    return this.renderer.createEditorElement(this.target.parent);
  }

  get children(): PebEditorElement[] {
    return this.definition.children?.map(
      elDef => this.renderer.registry.get(elDef.id),
    );
  }

  get siblings(): PebEditorElement[] {
    return this.parent.children.filter(c => c !== this);
  }

  get contentContainer(): HTMLElement {
    return this.target.contentContainer;
  }

  get potentialContainer(): HTMLElement {
    return this.target.potentialContainer;
  }

  get textContent(): HTMLElement {
    if (this.target instanceof PebButtonElement || this.target instanceof PebTextElement) {
      return (this.target as (PebButtonElement | PebTextElement)).textContent;
    }

    return null;
  }

  get controlsSlot(): ViewContainerRef {
    return this.target.controlsSlot;
  }

  setTextContent(value, elementClass): void {
    // TODO: commented out due error on prod
    // if (elementClass !== 'PebTextElement') {
    //   throw new Error(`The component isn't instance of Class PebTextElement`);
    // }
    this.target.styles.content = value;
  }

  detectChanges() {
    this.target.cdr.detectChanges();
  }

  applyStyles() {
    this.target.applyStyles();
  }

  getAbsoluteElementRect(): PebDOMRect {
    return this.getNodeRect(this.nativeElement);
  }

  getContentContainerRect(): PebDOMRect {
    return this.getNodeRect(
      this.target.contentContainer
      || this.target.potentialContainer
      || this.target.nativeElement);
  }

  getNodeRect(node: HTMLElement): PebDOMRect {
    const scale = this.renderer.options.scale;

    const rendererRect = this.renderer.nativeElement.getBoundingClientRect();
    const elementRect = node.getBoundingClientRect();

    const horizontalMargin = (rendererRect.width / scale - PEB_DESKTOP_CONTENT_WIDTH) / 2;

    return {
      left: Math.ceil((elementRect.left - rendererRect.left) / scale - horizontalMargin),
      top: Math.ceil((elementRect.top - rendererRect.top) / scale),
      width: Math.ceil(elementRect.width / scale),
      height: Math.ceil(elementRect.height / scale),
      right: Math.ceil((elementRect.left - rendererRect.left + elementRect.width) / scale - horizontalMargin),
      bottom: Math.ceil((elementRect.top - rendererRect.top + elementRect.height) / scale),
      offsetLeft: Math.ceil(node.offsetLeft / scale),
      offsetTop: Math.ceil(node.offsetTop / scale),
    };
  }

  getCalculatedMargins(): PebMargins {
    const scale = this.renderer.options.scale;
    const nativeStyleDecl = getComputedStyle(this.nativeElement);

    return {
      marginTop: parseInt(nativeStyleDecl.getPropertyValue('margin-top'), 10) / scale,
      marginBottom: parseInt(nativeStyleDecl.getPropertyValue('margin-bottom'), 10) / scale,
      marginLeft: parseInt(nativeStyleDecl.getPropertyValue('margin-left'), 10) / scale,
      marginRight: parseInt(nativeStyleDecl.getPropertyValue('margin-right'), 10) / scale,
    };
  }

  public getMinDefinedDimensions(): {
    width: number, height: number
  } {
    // FIXME: Use values defined at components
    // Since this will be refactored - I will temporarily add it here
    // size with scale 100%

    const factoryResult = (width: number, height: number): {
      width: number, height: number
    } => {
      return {
        width,
        height
      }
    }

    switch (this.definition.type) {
      case PebElementType.Text:
        return factoryResult(32, 18)
      case PebElementType.ProductDetails:
        return factoryResult(1024 * 0.72, 500)
      default:
        return factoryResult(20, 20)
    }
  }

  getMinPossibleDimensions(axis: Axis): number {
    if (!this.contentContainer || !this.children.length) {
      return this.getMinDefinedDimensions()[AxisProps[axis].size];
    }

    const contentRect = this.getContentContainerRect();
    const childrenRects = this.children.map(childCmp => childCmp.getAbsoluteElementRect());

    if (!contentRect) {
      return;
    }

    const maxEnd = Math.max(
      getAxisRectStart(axis, contentRect),
      ...childrenRects.map(r => getAxisRectEnd(axis, r)),
    );

    return maxEnd - getAxisRectStart(axis, contentRect);
  }

  getMaxPossibleDimensions(axis: Axis): MaxPossibleDimensions {
    const elementRect = this.getAbsoluteElementRect();
    const parentRect = this.parent.getContentContainerRect();

    if (!elementRect || !parentRect) {
      return;
    }

    const oppAxis = AxisOpposite[axis];

    const range = this.siblings.reduce((result: any, siblingCmp) => {
      const siblingRect = siblingCmp.getAbsoluteElementRect();

      const oppAxisStartProp = AxisProps[oppAxis].start;
      const oppAxisEndProp = AxisProps[oppAxis].end;

      if (siblingRect[oppAxisEndProp] < elementRect[oppAxisStartProp]
        || siblingRect[oppAxisStartProp] > elementRect[oppAxisEndProp]
      ) {
        return result;
      }

      const startProp = AxisProps[axis].start;
      const endProp = AxisProps[axis].end;

      if (siblingRect[endProp] <= elementRect[startProp]) {
        result.start = Math.max(result.start, siblingRect[endProp]);
      }
      if (siblingRect[startProp] >= elementRect[endProp]) {
        result.end = Math.min(result.end, siblingRect[startProp]);
      }

      return result;
    }, { start: parentRect[AxisProps[axis].start], end: parentRect[AxisProps[axis].end] });

    return {
      ...range,
      spaceStart: elementRect[AxisProps[axis].start] - range.start,
      size: range.end - range.start,
      spaceEnd: range.end - elementRect[AxisProps[axis].end],
    };
  }

  // TODO: Should be reimplemented since doesn't calculate maximum possible rectangle.
  //  @see: https://docs.google.com/spreadsheets/d/1vXZCHH2PPoHZpZNlIhLmNKIpxgLS-dxuKooNoTpFXLQ/edit#gid=304958590
  getMaxProportionalDimensions() {
    const elementRect = this.getAbsoluteElementRect();

    const horizontalLimits = this.getMaxPossibleDimensions(Horizontal);
    const verticalLimits = this.getMaxPossibleDimensions(Vertical);

    if (!horizontalLimits || !verticalLimits) {
      return;
    }

    const startCornerRect = {
      left: horizontalLimits.start,
      top: verticalLimits.start,
      right: elementRect.left,
      bottom: elementRect.top,
    };
    const startCornerLines = {
      horizontal: [horizontalLimits.start],
      vertical: [verticalLimits.start],
    };
    const endCornerRect = {
      left: elementRect.right,
      top: elementRect.bottom,
      right: horizontalLimits.end,
      bottom: verticalLimits.end,
    };
    const endCornerLines = {
      horizontal: [horizontalLimits.start],
      vertical: [verticalLimits.start],
    };

    this.siblings.forEach((siblingCmp) => {
      const siblingRect = siblingCmp.getAbsoluteElementRect();

      if (pointInRect(startCornerRect, { x: siblingRect.right, y: siblingRect.bottom })) {
        startCornerLines.horizontal.push(siblingRect.right);
        startCornerLines.vertical.push(siblingRect.bottom);
      }

      if (pointInRect(endCornerRect, { x: siblingRect.left, y: siblingRect.top })) {
        startCornerLines.horizontal.push(siblingRect.left);
        startCornerLines.vertical.push(siblingRect.top);
      }
    });

    return {
      left: Math.max(...startCornerLines.horizontal),
      top: Math.max(...startCornerLines.vertical),
      right: Math.min(...startCornerLines.horizontal),
      bottom: Math.min(...startCornerLines.horizontal),
    };
  }
}
