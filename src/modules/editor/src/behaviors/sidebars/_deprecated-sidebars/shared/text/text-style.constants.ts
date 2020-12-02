import { SelectOption } from '../select/select.component';

export const fontOptions: SelectOption[] = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier',
  'Courier New',
  'Georgia',
  'Roboto',
  'Tahoma',
  'Times New Roman',
  'Verdana',
].map(name => ({
  name,
  style: 'font-family: ' + name + ';',
}));

export const fontStyleOptions: SelectOption[] = [
  {
    name: 'Regular',
    style: '',
    value: 'regular',
  },
  {
    name: 'Italic',
    style: 'font-style: italic;',
    value: 'italic',
  },
  {
    name: 'bold',
    style: 'font-weight: bold;',
    value: 'bold',
  },
  {
    name: 'Bold Italic',
    style: 'font-weight: bold; font-style: italic;',
    value: 'Bold Italic',
  },
];

export const spacingOptions: SelectOption[] = [
  {
    name: 'Page',
    style: '',
  },
  {
    name: 'Single Product',
    style: '',
  },
];

export const characterStyleOptions: SelectOption[] = [
  {
    name: 'None',
    style: '',
  },
  {
    name: 'Bold',
    style: 'font-weight: bold;',
  },
  {
    name: 'Italic',
    style: 'font-style: italic;',
  },
  {
    name: 'Underline',
    style: 'text-decoration: underline;',
  },
  {
    name: 'Red Bold',
    style: 'color: red; font-weight: bold;',
  },
];

export const paragraphStyleOptions: SelectOption[] = [
  {
    name: 'Title',
    style: 'font-size: 3em;font-weight: bold;',
    value: '40',
  },
  {
    name: 'Subtitle',
    style: 'font-size: 2em;font-weight: bold;',
    value: '32',
  },
  {
    name: 'Body',
    style: 'font-size: 1.87em;font-weight: bold;',
    value: '24',
  },
  {
    name: 'Body Small',
    style: 'font-size: 1.87em;',
    value: '24',
  },
];

export enum TextAlignmentConstants {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}
