import { PebElementDef, PebElementStyles, PebElementType } from '@pe/builder-core';

export interface ElementTransformation {
  definition: PebElementDef;
  styles: PebElementStyles;
}

export const transformShape = (definition: PebElementDef, styles: PebElementStyles): ElementTransformation => {
  return {
    definition: {
      id: definition.id,
      type: PebElementType.Block,
      children: [],
    },
    styles: {
      ...styles,
    },
  };
};

export const transformImage = (definition: PebElementDef, styles: PebElementStyles): ElementTransformation => {
  return {
    definition: {
      id: definition.id,
      type: PebElementType.Block,
      children: [],
    },
    styles: {
      ...styles,
      backgroundImage: `${styles.background}`,
      backgroundSize: '100% 100%',
    },
  };
};

export const transformProductDetails = (definition: PebElementDef, styles: PebElementStyles): ElementTransformation => {
  return {
    definition: {
      id: definition.id,
      type: PebElementType.ProductDetails,
      children: definition.children,
      data: definition.data,
      meta: definition.meta,
    },
    styles: {
      ...styles
    },
  };
};

export const movingTransformations = {
  [PebElementType.Shape]: transformShape,
  [PebElementType.Image]: transformImage,
  [PebElementType.ProductDetails]: transformProductDetails,
};
