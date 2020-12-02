import { PebInteractionType } from '@pe/builder-core';

import { SelectOption } from '../shared/select/select.component';

export const pageOptions: SelectOption[] = [
  { name: 'None', value: 'none' },
  { name: 'Page', value: PebInteractionType.NavigateInternal },
  { name: 'Custom Link', value: PebInteractionType.NavigateExternal },
];

export const fillOptions: SelectOption[] = [
  {
    name: 'Color fill',
    value: 'color',
  },
  {
    name: 'Gradient fill',
    value: 'gradient',
  },
];

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
  'Verdana'
].map(name => ({
  name,
  value: name,
  style: 'font-family: ' + name + ';'
}));

export const borderOptions: SelectOption[] = ['Line', 'Picture Frame'].map(name => ({
  name
}));
