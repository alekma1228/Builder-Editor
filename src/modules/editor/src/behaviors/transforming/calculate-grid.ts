import { flatten, last } from 'lodash';

import { pebCreateLogger } from '@pe/builder-core';

import { PebEditorElement } from '../../renderer/editor-element';

const log = pebCreateLogger('calculateGrid');

export function calculateGrid(parentEl: PebEditorElement, childrenEls: PebEditorElement[]) {

  if (childrenEls.length === 1) {
    return calculateMargins(parentEl, childrenEls[0]);
  }

  const parentRect = parentEl.getContentContainerRect();

  const pointsFromRect = (elId, rect) => [
    {
      elId,
      type: 'open',
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
    },
    {
      elId,
      type: 'close',
      x: rect.right - parentRect.left,
      y: rect.bottom - parentRect.top,
    },
  ];

  const points = [
    ...pointsFromRect(parentEl.definition.id, parentEl.getContentContainerRect()),
    ...flatten(childrenEls.map(el => pointsFromRect(el.definition.id, el.getAbsoluteElementRect()))),
  ];

  const edges = ['x', 'y'].reduce((result, axis) => {
    const typeOrder = ['close', 'open'];
    const ranges = points
      .sort((a, b) =>
        a[axis] === b[axis]
          ? typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
          : a[axis] - b[axis],
      )
      .reduce((currRanges, point) => {
        const prevRange = last(currRanges);
        const currentRange = {
          point,
          starts: prevRange ? prevRange.ends : 0,
          ends: point[axis],
          strength: prevRange
            ? prevRange.strength + (prevRange.point.type === 'open' ? 1 : -1)
            : 0,
        };

        return [...currRanges, currentRange];
      },      []);

    const breakpoints = [];
    for (let i = 1; i <= ranges.length - 1; i++) {
      const prevRange = ranges[i - 1];
      const currentRange = ranges[i];
      const nextRange = ranges[i + 1];

      if (currentRange.strength === prevRange.strength) {
        breakpoints.push(currentRange.starts);
      }

      if (nextRange && currentRange.strength < prevRange.strength && currentRange.strength < nextRange.strength) {
        breakpoints.push(currentRange.starts + (currentRange.ends - currentRange.starts) / 2);
      }
    }
    breakpoints.unshift(ranges[0].starts);
    breakpoints.push(last(ranges).ends);

    return { ...result, [axis]: breakpoints };
  },                              {} as any);

  const gridAreas = [];
  for (let ix = 1; ix < edges.x.length; ix++) {
    for (let iy = 1; iy < edges.y.length; iy++) {
      gridAreas.push({
        x: ix, y: iy,
        left: edges.x[ix - 1],
        right: edges.x[ix],
        top: edges.y[iy - 1],
        bottom: edges.y[iy],
      });
    }
  }

  const childrenChanges = childrenEls.reduce((acc, child) => {
    const childRectAbsolute = child.getAbsoluteElementRect();
    const childRect = {
      left: childRectAbsolute.left - parentRect.left,
      top: childRectAbsolute.top - parentRect.top,
      bottom: childRectAbsolute.bottom - parentRect.top,
      right: childRectAbsolute.right - parentRect.left,
    };

    const childPoints = [
      { x: childRect.left, y: childRect.top, type: 'start' },
      { x: childRect.right, y: childRect.bottom, type: 'end' },
    ];
    const [startArea, endArea] = childPoints.map(point => {
      return gridAreas.find(area => {
        return point.x >= area.left
          && (point.x <= area.right || (point.x === parentRect.width && point.x === area.right))
          && point.y >= area.top
          && (point.y <= area.bottom || (point.y === parentRect.height && point.y === area.bottom));
      });
    });

    if (!startArea || !endArea) {
      log('Problem in grid calculations: startArea or endArea is not calculated correct');
    }

    return {
      ...acc,
      [child.definition.id]: {
        ...child.styles,
        gridRow: `${startArea.y} / span ${endArea.y - startArea.y + 1}`,
        gridColumn: `${startArea.x} / span ${endArea.x - startArea.x + 1}`,
        width: child.styles.width || (childRect.right - childRect.left),
        // TODO: Current implementation order of style definition is important
        //       We should update abstractElement.mappedstyles() so it would it would always produce
        //       predictable StylesMap.
        // --> That's why there is declared margin and marginTop/Left styles
        marginTop: childRect.top - startArea.top,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: childRect.left - startArea.left,
        margin: `${childRect.top - startArea.top} 0 0 ${childRect.left - startArea.left}`,
      },
    };
  },                                         {});

  const newRows = sectionsFromBreakpoints(edges.x).join(' ');
  const newColumns = sectionsFromBreakpoints(edges.y).join(' ');

  const parentChanges = {
    ...parentEl.styles,
    display: 'grid',
    gridTemplateRows: newColumns,
    gridTemplateColumns: newRows,
  };

  return {
    [parentEl.definition.id]: parentChanges,
    ...childrenChanges,
  };

}

function sectionsFromBreakpoints(breakpoints: number[]) {
  return breakpoints.slice(1).map((val, i) => val - breakpoints[i]);
}

function calculateMargins(parentEl: PebEditorElement, child: PebEditorElement) {
  const parentRect = parentEl.getAbsoluteElementRect();
  const parentContentRect = parentEl.getContentContainerRect();


  const parentChanges = {
    ...parentEl.styles,
    display: 'flex', // Need for fix margin collapse
    gridTemplateRows: null,
    gridTemplateColumns: null,
    height: parentRect.height,
  };

  const childRectAbsolute = child.getAbsoluteElementRect();

  const childrenChanges = {
    [child.definition.id]: {
      ...child.styles,
      gridArea: null,
      // TODO: Current implementation order of style definition is important
      //       We should update abstractElement.mappedstyles() so it would it would always produce
      //       predictable StylesMap.
      // --> That's why there is declared margin and marginTop/Left styles
      margin: `${childRectAbsolute.top - parentContentRect.top} 0 0 ${childRectAbsolute.left - parentContentRect.left}`,
      marginTop: childRectAbsolute.top - parentContentRect.top,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: childRectAbsolute.left - parentContentRect.left,
    },
  };

  return {
    [parentEl.definition.id]: parentChanges,
    ...childrenChanges,
  };
}
