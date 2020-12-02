import { cloneDeep, sum } from 'lodash';

import { PebElementStyles } from '@pe/builder-core';

import { Axis, PebEditorElement } from '../../renderer/editor-element';
import { PebDOMRect } from '../../editor.typings';
import { AnchorType } from '../../controls/element-anchors/element-anchors.control';

export const axisSizeProps = {
  [Axis.Horizontal]: 'width',
  [Axis.Vertical]: 'height',
};

export const axisMarginProps = {
  [Axis.Horizontal]: 'marginLeft',
  [Axis.Vertical]: 'marginTop',
};

export const axisEventProps = {
  [Axis.Horizontal]: 'pageX',
  [Axis.Vertical]: 'pageY',
};

export function getStartOffsetForAxis(axis: Axis, elementStyles: PebElementStyles, elementDomRect: PebDOMRect): number {
  return ({
    [Axis.Horizontal]: (styles) => 'marginLeft' in styles
      ? +styles.marginLeft
      : styles.margin
      ? +('' + styles.margin).split(' ')[3] || elementDomRect.offsetLeft
      : 0,
    [Axis.Vertical]: (styles) => 'marginTop' in styles
      ? +styles.marginTop
      : +('' + styles.margin).split(' ')[0] || 0,
  }[axis](elementStyles));
};

// TODO: Get rid of element Node after implementing proper styling interaction
export function setSizeForAxis(axis: Axis, value: number, elementNode: HTMLElement, scale: number): PebElementStyles {
  const nativeStyleDecl = getComputedStyle(elementNode);

  const styles = {
    paddingTop: parseInt(nativeStyleDecl.getPropertyValue('padding-top'), 10),
    paddingRight: parseInt(nativeStyleDecl.getPropertyValue('padding-right'), 10),
    paddingBottom: parseInt(nativeStyleDecl.getPropertyValue('padding-bottom'), 10),
    paddingLeft: parseInt(nativeStyleDecl.getPropertyValue('padding-left'), 10),
    borderTop: parseInt(nativeStyleDecl.getPropertyValue('border-top-width'), 10),
    borderRight: parseInt(nativeStyleDecl.getPropertyValue('border-right-width'), 10),
    borderBottom: parseInt(nativeStyleDecl.getPropertyValue('border-bottom-width'), 10),
    borderLeft: parseInt(nativeStyleDecl.getPropertyValue('border-left-width'), 10),
  };

  const spaces = (axis === Axis.Vertical
    ? styles.paddingTop + styles.paddingBottom + styles.borderTop + styles.borderBottom
    : styles.paddingLeft + styles.paddingRight + styles.borderLeft + styles.borderRight
  ) / scale;

  return { [axisSizeProps[axis]]: value - spaces };
};

export function setOffsetForAxis(axis: Axis, elStyles: PebElementStyles, value: number): PebElementStyles {
  const margins = getMarginsArrayFromStyles(elStyles);

  return {
    [Axis.Horizontal]: (styles) => ({
      margin: [...margins.slice(0, -1), value].join(' '),
      ...('marginLeft' in styles ? { marginLeft: value } : null),
    }),
    [Axis.Vertical]: (styles) => ({
      margin: [value, ...margins.slice(1)].join(' '),
      ...('marginTop' in styles ? { marginTop: value } : null),
    }),
  }[axis](cloneDeep(elStyles));
};

export function adaptGridAreas(maxFullGridSize: number, gridTemplateAreas: string, adaptLastArea = true) {
  const gridAreas = gridTemplateAreas.split(' ').map(v => parseInt(v, 10));

  if (adaptLastArea) {
    return [
      ...gridAreas.slice(0, -1),
      maxFullGridSize - sum(gridAreas.slice(0, -1)),
    ].join(' ');
  } else {
    return [
      maxFullGridSize - sum(gridAreas.slice(1)),
      ...gridAreas.slice(1),
    ].join(' ');
  }
}

export function getGridStyles(elementNode: HTMLElement, scale: number): PebElementStyles {
  const nativeStyleDecl = getComputedStyle(elementNode);
  const height = parseInt(nativeStyleDecl.getPropertyValue('height'), 10);
  const width = parseInt(nativeStyleDecl.getPropertyValue('width'), 10);
  return {
    gridTemplateRows: adaptGridAreas( // Fix last grid area size if grid is bigger then element
      height,
      nativeStyleDecl.getPropertyValue('grid-template-rows'),
    )
    .split(' ')
    .map(v => `${parseInt(v, 10) / scale}px`)
    .join(' '),
    gridTemplateColumns: adaptGridAreas( // Fix last grid area size if grid is bigger then element
      width,
      nativeStyleDecl.getPropertyValue('grid-template-columns'),
    )
    .split(' ')
    .map(v => `${parseInt(v, 10) / scale}px`)
    .join(' '),
  };
};

export function isElementOverflowingContainer(nextStart: number, nextSize: number, containerSize: number): boolean {
  return nextStart + nextSize > containerSize;
}

export function fixPositionForOverflowingElement(nextStart: number, nextSize: number, containerSize: number): number {
  return nextStart + (containerSize - (nextStart + nextSize));
}

// TODO: Refactor
// also previous version of getMinDimensions should be replaced with current one
export function getMinDimensions(resizingElement: PebEditorElement, anchorType: AnchorType): {
  width: number,
  height: number,
} {
  const parentRect = resizingElement.getAbsoluteElementRect();

  return resizingElement.children.reduce((acc, child) => {
    const childRect = child.getAbsoluteElementRect();

    if (anchorType === AnchorType.MiddleRight) {
      const spaceFromLeft = childRect.left - parentRect.left;
      const minWidth = spaceFromLeft + childRect.width;

      return {
        ...acc,
        width: acc.width < minWidth ? minWidth : acc.width,
      };
    }

    if (anchorType === AnchorType.MiddleLeft) {
      const spaceFromRight = parentRect.right - childRect.right;

      return {
        ...acc,
        width: acc.width < spaceFromRight + childRect.width
          ? spaceFromRight + childRect.width
          : acc.width,
      };
    }

    if (anchorType === AnchorType.BottomCenter) {
      const spaceFromTop = childRect.top - parentRect.top;
      const height = spaceFromTop + childRect.height;

      return {
        ...acc,
        height: Math.max(acc.height, height),
      };
    }

    if (anchorType === AnchorType.TopCenter) {
      const spaceFromBottom = parentRect.bottom - childRect.bottom;

      return {
        ...acc,
        height: acc.height < spaceFromBottom + childRect.height
          ? spaceFromBottom + childRect.height
          : acc.height,
      };
    }

    if (anchorType === AnchorType.BottomLeft) {
      const spaceFromTop = childRect.top - parentRect.top;
      const spaceFromRight = parentRect.right - childRect.right;

      return {
        height: acc.height < spaceFromTop + childRect.height
          ? spaceFromTop + childRect.height
          : acc.height,
        width: acc.width < spaceFromRight + childRect.width
          ? spaceFromRight + childRect.width
          : acc.width,
      };
    }

    if (anchorType === AnchorType.TopLeft) {
      const spaceFromBottom = parentRect.bottom - childRect.bottom;
      const spaceFromRight = parentRect.right - childRect.right;

      return {
        height: acc.height < spaceFromBottom + childRect.height
          ? spaceFromBottom + childRect.height
          : acc.height,
        width: acc.width < spaceFromRight + childRect.width
          ? spaceFromRight + childRect.width
          : acc.width,
      };
    }

    if (anchorType === AnchorType.TopRight) {
      const spaceFromBottom = parentRect.bottom - childRect.bottom;
      const spaceFromLeft = childRect.left - parentRect.left;

      return {
        height: acc.height < spaceFromBottom + childRect.height
          ? spaceFromBottom + childRect.height
          : acc.height,
        width: acc.width < spaceFromLeft + childRect.width
          ? spaceFromLeft + childRect.width
          : acc.width,
      };
    }

    if (anchorType === AnchorType.BottomRight) {
      const spaceFromTop = childRect.top - parentRect.top;
      const spaceFromLeft = childRect.left - parentRect.left;

      return {
        height: acc.height < spaceFromTop + childRect.height
          ? spaceFromTop + childRect.height
          : acc.height,
        width: acc.width < spaceFromLeft + childRect.width
          ? spaceFromLeft + childRect.width
          : acc.width,
      };
    }

    return acc;

  }, resizingElement.getMinDefinedDimensions());
}

function getMarginsArrayFromStyles(styles: PebElementStyles): string[] {
  if (styles.margin) {
    const marginArray = (styles.margin as string).split(' ');
    return [
      marginArray[0],
      marginArray[1] || marginArray[0],
      marginArray[2] || marginArray[0],
      marginArray[3] || marginArray[1] || marginArray[0],
    ];
  } else {
    return [
      `${styles.marginTop || 0}`,
      `${styles.marginRight || 0}`,
      `${styles.marginBottom || 0}`,
      `${styles.marginLeft || 0}`,
    ];
  }
}
