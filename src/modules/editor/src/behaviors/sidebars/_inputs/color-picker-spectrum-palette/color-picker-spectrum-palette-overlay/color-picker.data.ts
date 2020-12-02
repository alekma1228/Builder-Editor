import { InjectionToken } from '@angular/core';

export type ColorPickerAlphaChannelType = 'enabled'| 'disabled'| 'always' | 'forced';
export type ColorPickerOutputFormat = 'auto' | 'hex' | 'rgba' | 'hsla';
export type ColorPickerPosition = 'auto' | 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';

export interface ColorPickerData {
  color: string;
  disabled: boolean;
  cpAlphaChannel: ColorPickerAlphaChannelType;
  cpOutputFormat: ColorPickerOutputFormat;
  cpPositionOffset: string;
  cpPosition: ColorPickerPosition;
  isPalette?: boolean;
}

export const COLOR_PICKER_DATA = new InjectionToken<ColorPickerData>('COLOR_PICKER_DATA');
