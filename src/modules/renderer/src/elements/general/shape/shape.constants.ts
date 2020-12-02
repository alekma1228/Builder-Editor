import { PebElementDef, PebElementId, PebElementType } from '@pe/builder-core';

export enum PebShapeVariant {
  Circle = 'circle',
  Square = 'square',
  Triangle = 'triangle',
}

export interface PebElementShape extends PebElementDef {
  id: PebElementId;
  type: PebElementType.Shape;
  data: {
    text?: string;
    variant: PebShapeVariant;
  };
  children: null;
}
