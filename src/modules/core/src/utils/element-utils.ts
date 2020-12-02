import { isArray, isFunction, merge } from 'lodash';

import { PebTemplate } from '../models/client';
import { PebElementDef, PebElementId, PebElementWithParent } from '../models/element';
import { Renderer2 } from '@angular/core';
import { PEB_FONT_SIZE_ATTRIBUTE } from '../constants';

export function pebMapElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => PebElementDef,
): PebElementDef {
  const { children: children = [], ...elementProps } = handler(element);

  return {
    ...merge({}, elementProps),
    children: children.map(child => pebMapElementDeep(child, handler)),
  };
}

export function pebFindElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => boolean,
): PebElementDef {
  return element.children?.reduce(
    (acc, el) => acc ? acc : handler(el) ? el : pebFindElementDeep(el, handler),
    undefined,
  );
}

export function pebFindElementsDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => boolean,
): PebElementDef[] {
  return element.children?.reduce(
    (acc, el) => ([
      ...acc,
      ...(handler(el) ? [el] : pebFindElementsDeep(el, handler)),
    ]),
    [],
  );
}

export function pebFilterElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => boolean,
): PebTemplate | PebElementDef {
  const nextChildren = element.children?.filter(handler);

  return {
    ...merge({}, element),
    children: nextChildren?.map(child => pebFilterElementDeep(child, handler)),
  };
}

export function pebTraverseElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => any,
): void {
  handler(merge({}, element));

  if (isArray(element.children)) {
    element.children.forEach(el => pebTraverseElementDeep(el, handler));
  }
}

export function pebFindElementParents(document: PebElementDef, id: PebElementId): PebElementDef[] {
  const stack = [{ node: document, i: 0 }];
  while (stack.length) {
    let current = stack[stack.length - 1];
    while (current.i < current.node.children.length) {
      const node = current.node.children[current.i];

      if (node.id === id) {
        return stack
          .filter(el => el.node.id !== document.id)
          .map(el => el.node);
      }

      stack.push({ node, i: 0 });
      current.i++;
      current = stack[stack.length - 1];
    }

    stack.pop();
  }

  return null;
}

export function pebFindElementChildren(
  element: PebElementDef,
  predicate?: ((e: PebElementDef) => boolean),
): PebElementDef[] {
  if (predicate && !isFunction(predicate)) {
    throw new Error('Unsupported selector');
  }

  predicate = predicate || (() => true); // tslint:disable-line

  const result = [];

  pebTraverseElementDeep(element, el => {
    if (predicate(el)) {
      result.push(el);
    }
  });

  return result;
}

export function pebTraverseElementDeepWithParent(
  element: PebElementDef,
  handler: (el: any) => any,
  parentId: null | string = null,
  priority: any = -1,
): void {
  const nextPriority = parseInt(priority, 10) + 1;
  handler({ ...element, parentId, priority: nextPriority });

  if (isArray(element?.children)) {
    element.children.forEach(el => pebTraverseElementDeepWithParent(el, handler, element.id, nextPriority));
  }
}

export function pebFindElementChildrenWithParent(
  element: PebElementDef,
  predicate: ((e: PebElementDef) => boolean) = (() => true),
): PebElementWithParent[] {
  if (predicate && !isFunction(predicate)) {
    throw new Error('Unsupported selector');
  }

  const result = [];

  pebTraverseElementDeepWithParent(element, el => {
    if (predicate(el)) {
      result.push(el);
    }
  });

  return result;
}

/**
 * Transform multiple style considering scale
 * Example:
 *   10 5 auto 0 => 10px 5px auto 0px
 *   3fr => 3fr
 *   10 => 10px
 *   50% => 50%
 *   auto => auto
 */
export const transformStyleProperty = (properties: string | number, scale: number) => String(properties)
  .split(' ')
  .map(property =>
    (property).toString().includes('%')
    || (property).toString().includes('fr')
    || isNaN(parseInt(property as string, 10))
      ? property
      : Number(property) * scale + 'px',
  ).join(' ');

export const scaleTextInnerFonts = (renderer: Renderer2, text: string, scale: number): string => {
  const wrapper = renderer.createElement('div');
  wrapper.innerHTML = text;
  scaleInnerFonts(wrapper, scale);
  return wrapper.innerHTML;
}

export const scaleInnerFonts = (wrapper, scale: number) => {
  if (wrapper.tagName === 'FONT' && (wrapper.style.fontSize || wrapper.hasAttribute(PEB_FONT_SIZE_ATTRIBUTE))) {
    if (wrapper.hasAttribute(PEB_FONT_SIZE_ATTRIBUTE)) {
      wrapper.style.fontSize = (+wrapper.getAttribute(PEB_FONT_SIZE_ATTRIBUTE) * scale) + 'px';
    } else {
      const matches = wrapper.style.fontSize.match(/^(\d+\.?\d*)\s*px/);
      const fontSize = transformStyleProperty(matches ? matches[1] : wrapper.style.fontSize, scale);
      wrapper.style.fontSize = fontSize;
    }
  }
  if (wrapper.children.length > 0) {
    for (let i = 0; i < wrapper.children.length; i++) {
      scaleInnerFonts(wrapper.children.item(i), scale);
    }
  }
}
