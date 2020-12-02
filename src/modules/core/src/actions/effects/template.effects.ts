import { PebEffect, PebEffectTarget, PebTemplateEffect } from '../../models/action';
import { PebTemplate } from '../../models/client';
import { PebElementDef, PebElementId } from '../../models/element';
import { pebFilterElementDeep, pebFindElementDeep, pebMapElementDeep } from '../../utils/element-utils';

export const layoutsScopeName = 'layouts';

export interface PebAppendElementPayload {
  to: string;
  before?: string;
  element: PebElementDef;
}

export interface PebRelocateElementPayload {
  nextParentId: string;
  elementId: PebElementId;
}

export const pebLayoutEffectHandlers: {
  [effectName in PebTemplateEffect]: (prevLayout: null| PebTemplate, payload: any) => PebTemplate | null
} = {
  [PebTemplateEffect.Init]: pebLayoutInitHandler,
  [PebTemplateEffect.Destroy]: pebLayoutDestroyHandler,
  [PebTemplateEffect.AppendElement]: pebLayoutAppendElementHandler,
  [PebTemplateEffect.UpdateElement]: pebLayoutUpdateElementHandler,
  [PebTemplateEffect.RelocateElement]: pebLayoutRelocateElementHandler,
  [PebTemplateEffect.DeleteElement]: pebLayoutDeleteElementHandler,
};

export function pebLayoutInitHandler(prevLayout: null, payload: PebTemplate) {
  return payload;
}

export function pebLayoutDestroyHandler(prevLayout: null | PebTemplate) {
  return null;
}

export function pebLayoutAppendElementHandler(prevLayout: PebTemplate, payload: PebAppendElementPayload): PebTemplate {
  return pebMapElementDeep(
    prevLayout,
    el => {
      if (payload.before && el.children && el.children.map((child) => child.id).includes(payload.before)) {
        const getAfterElInd = el.children.findIndex((child) => child.id === payload.before);
        el.children.splice(getAfterElInd, 0, payload.element);
        return el;
      }
      return el.id === payload.to ? { ...el, children: [...el.children, payload.element] } : el},
  ) as PebTemplate;
}

export function pebLayoutCreateUpdateElementEffect(templateId: string, element: PebElementDef): PebEffect {
  return {
    type: PebTemplateEffect.UpdateElement,
    target: `${PebEffectTarget.Templates}:${templateId}`,
    payload: element,
  };
}

export function pebLayoutUpdateElementHandler(prevLayout: PebTemplate, payload: PebElementDef): PebTemplate {
  const result = pebMapElementDeep(
    prevLayout,
    el => el.id === payload.id ? payload : el,
  );

  return result as PebTemplate;
}

export function pebLayoutRelocateElementHandler(prevLayout: PebTemplate, payload: PebRelocateElementPayload) {
  const element = pebFindElementDeep(prevLayout, el => el.id === payload.elementId);

  if (!element) {
    throw new Error(`There is no element with id: ${payload.elementId} in layout`);
  }

  return pebMapElementDeep(
    prevLayout,
    el => {
      if (el.children?.length && el.children.find(e => e.id === element.id)) {
        return { ...el, children: el.children.filter(e => e.id !== element.id) }
      }

      return el.id === payload.nextParentId ? { ...el, children: [...el.children, element ] } : el;
    },
  ) as PebTemplate;
}

export function pebLayoutDeleteElementHandler(prevLayout: PebTemplate, payload: PebElementId): PebTemplate {
  return pebFilterElementDeep(prevLayout, c => c.id !== payload) as PebTemplate;
}
