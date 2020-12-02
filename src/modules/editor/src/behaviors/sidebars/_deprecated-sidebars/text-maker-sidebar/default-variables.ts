import { forEach } from 'lodash';

import { PebInteractionType } from '@pe/builder-core';

import { SelectOption } from '../shared/select/select.component';

export const linkVariables: SelectOption[] = [
  {
    name: 'None',
    style: '',
    value: false,
  },
  {
    name: 'Page',
    style: '',
    value: PebInteractionType.NavigateInternal,
  },
  {
    name: 'Custom link',
    style: '',
    value: PebInteractionType.NavigateExternal,
  },
];

export const borderVariables: SelectOption[] = [
  {
    name: 'Empty',
    style: '',
    value: 'inherit',
  },
  {
    name: 'Solid',
    style: '',
    value: 'solid',
  },
  {
    name: 'Dotted',
    style: '',
    value: 'dotted',
  },
  {
    name: 'Dashed',
    style: '',
    value: 'dashed',
  },
  {
    name: 'Double',
    style: '',
    value: 'double',
  },
  {
    name: 'Groove',
    style: '',
    value: 'groove',
  },
  {
    name: 'Ridge',
    style: '',
    value: 'ridge',
  },
  {
    name: 'Inset',
    style: '',
    value: 'inset',
  },
  {
    name: 'Outset',
    style: '',
    value: 'outset',
  },
];

export const paragraphStylesVariables: SelectOption[] = [
  {
    name: '',
    style: '',
    value: '',
  },
  {
    name: 'Heading 1',
    style: '',
    value: 'h1',
  },
  {
    name: 'Heading 2',
    style: '',
    value: 'h2',
  },
  {
    name: 'Heading 3',
    style: '',
    value: 'h3',
  },
  {
    name: 'Heading 4',
    style: '',
    value: 'h4',
  },
  {
    name: 'Heading 5',
    style: '',
    value: 'h5',
  },
  {
    name: 'Paragraph',
    style: '',
    value: 'p',
  },
  {
    name: 'Blockquote',
    style: '',
    value: 'blockquote',
  },
  {
    name: 'Codeblock',
    style: '',
    value: 'pre',
  },
  {
    name: 'Subscript',
    style: '',
    value: 'sub',
  },
];

export const fontNamesVariables: SelectOption[] = [
  {
    name: 'Roboto',
    style: 'font-family: Roboto',
    value: 'Roboto',
  },
  {
    name: 'Open Sans',
    style: 'font-family: "Open Sans", sans-serif',
    value: 'Open Sans, sans-serif',
  },
  {
    name: 'Montserrat',
    style: 'font-family: Montserrat',
    value: 'Montserrat',
  },
  {
    name: 'PT Sans',
    style: 'font-family: PT Sans',
    value: 'PT Sans',
  },
  {
    name: 'Lato',
    style: 'font-family: Lato',
    value: 'Lato',
  },
  {
    name: 'Space Mono',
    style: 'font-family: Space Mono',
    value: 'Space Mono',
  },
  {
    name: 'Work Sans',
    style: 'font-family: Work Sans',
    value: 'Work Sans',
  },
  {
    name: 'Rubik',
    style: 'font-family: Rubik',
    value: 'Rubik',
  },
  {
    name: 'Alata',
    style: 'font-family: Alata',
    value: 'Alata',
  },
  {
    name: 'Russo One',
    style: 'font-family: Russo One',
    value: 'Russo One',
  },
  {
    name: 'Noto Sans',
    style: 'font-family: Noto Sans',
    value: 'Noto Sans',
  },
  {
    name: 'Oswald',
    style: 'font-family: Oswald',
    value: 'Oswald',
  },
  {
    name: 'Poppins',
    style: 'font-family: Poppins',
    value: 'Poppins',
  },
  {
    name: 'Raleway',
    style: 'font-family: Raleway',
    value: 'Raleway',
  },
  {
    name: 'Merriweat',
    style: 'font-family: Merriweat',
    value: 'Merriweat',
  },
  {
    name: 'Playfair Display',
    style: 'font-family: Playfair Display',
    value: 'Playfair Display',
  },
];

export const colorPaletteVariables = ['#00a2ff', '#61d835', '#ee220d', '#f8ba00', '#ef5fa7', '#000000'];

export const fontStylesVariables: SelectOption[] = [
  {
    name: 'Regular',
    value: 'Regular',
    style: '',
  },
  {
    name: 'Italic',
    value: 'Italic',
    style: 'font-style: italic;',
  },
  {
    name: 'Bold',
    value: 'Bold',
    style: 'font-weight: bold;',
  },
];

export const fillNamesVariables: SelectOption[] = [
  { value: 'colorFill', name: 'Color fill' },
];


export function getParagraphStyle(text: string) {
  let paragraphStyle = paragraphStylesVariables[0];
  forEach(paragraphStylesVariables, (style: SelectOption) => {
    if (style.value) {
      const regExp = new RegExp('</' + style.value + '>', 'g');
      if (regExp.test(text)) {
        paragraphStyle = style;
        return false;
      }
    }
  });

  return paragraphStyle;
}

export function getFontFamily(text: string) {
  let fontFamily = fontNamesVariables[0];
  forEach(fontNamesVariables, (style: SelectOption) => {
    if (style.value) {
      const regExp = new RegExp(style.value, 'g');
      if (regExp.test(text)) {
        fontFamily = style;
        return false;
      }
    }
  });

  return fontFamily;
}
