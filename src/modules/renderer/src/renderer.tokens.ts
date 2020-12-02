import { EventEmitter, InjectionToken, Type } from '@angular/core';

import { PebElementType, PebMakerType } from '@pe/builder-core';

import { PebAbstractElement } from './elements/_abstract/abstract.element';

/** Collection of elements that renderer knows how to render */
export type ElementComponents<T> = { [name in PebElementType]: Type<T> };

export const ELEMENT_COMPONENTS = new InjectionToken<ElementComponents<any>>('ELEMENT_COMPONENTS');

/** Collection of elements that maker knows how to render */
type MakerComponentsCollectionType = { [name in PebMakerType]: Type<any> };

export const MakerComponentsCollection = new InjectionToken<MakerComponentsCollectionType>('MakersCollection');

/** Element render function provided by renderer */
export const RendererInteractionEmitter = new InjectionToken<EventEmitter<any>>('RendererInteractionEmitter');

/** Element parent */
export type GetParentComponentFunction = (elementCmp: PebAbstractElement) => PebAbstractElement;

export const RendererGetParentFunction = new InjectionToken<GetParentComponentFunction>('RendererGetParentFunction');
