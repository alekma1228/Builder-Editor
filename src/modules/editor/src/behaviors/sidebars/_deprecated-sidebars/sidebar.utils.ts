import { FormGroup } from '@angular/forms';

import { PebElementStyles } from '@pe/builder-core';

import { isBackgroundGradient } from '../../../utils';
import { SelectOption } from './shared/select/select.component';

export interface BgGradient {
  angle: number;
  startColor: string;
  endColor: string;
}

export function getGradientProperties(styles: PebElementStyles): BgGradient {
  const backgroundImage = styles.backgroundImage as string;

  let gradientColors: string[] = [];
  let gradientAngle: string;
  if (backgroundImage && isBackgroundGradient(backgroundImage)) {
    gradientColors = backgroundImage.match(new RegExp(/\([^)]+\)/g));
    if (gradientColors) {
      gradientColors = gradientColors[0].replace(new RegExp(/[()]/g), '').split(', ');
      gradientAngle = gradientColors[0].replace('deg', '');
    }
  }

  return {
    angle: +gradientAngle || 90,
    startColor: gradientColors[1] || 'white',
    endColor: gradientColors[2] || 'white',
  };
}

export const PageTypes: SelectOption[] = [
  { value: 'default', name: 'Default' },
  { value: 'category', name: 'Category' },
  { value: 'product', name: 'Product' },
  { value: '404', name: '404' },
];


export enum FillType {
  None = 'None',
  ColorFill = 'Color fill',
  ImageFill = 'Image fill',
  GradientFill = 'Gradient fill',
}

export const getFillType = (type: string) => FillTypes.find((option) => option.name === type);
export const FillTypes: SelectOption[] = [
  { name: 'None' },
  { name: 'Color fill' },
  { name: 'Image fill' },
  { name: 'Gradient fill' },
];

export enum PebTextStyleType {
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  Strike = 'line-through',
}

export enum PebTextAlignType {
  FlexStart = 'flex-start',
  Center = 'center',
  FlexEnd = 'flex-end',
  Between = 'space-between',
}

export enum ImageSize {
  Initial = 'initial',
  Contain = 'contain',
  Cover = 'cover',
  Stretch = '100% 100%',
  OriginalSize = 'auto',
}

export const ImageSizes: SelectOption[] = [
  { value: ImageSize.OriginalSize, name: 'Original Size' },
  // Size: '100% 100%';
  { value: ImageSize.Stretch, name: 'Stretch' },
  // Repeat: 'space';
  { value: ImageSize.Initial, name: 'Tile' },
  { value: ImageSize.Cover, name: 'Scale to Fill' },
  { value: ImageSize.Contain, name: 'Scale to Fit' },
];

export const PageSidebarDefaultOptions = {
  BgColor: '#ffffff',
  PageType: PageTypes[0],
  FillType: FillTypes[0],
  ImageSize: ImageSizes[0],
  ImageScale: 100,
};

export function initFillType(styles: PebElementStyles, form?: FormGroup) {
  if (styles.backgroundColor && styles.backgroundColor !== '') {
    return getFillType(FillType.ColorFill);
  }

  if (styles.backgroundImage && styles.backgroundImage !== '') {
    if (isBackgroundGradient(styles.backgroundImage as string, form)) {
      return getFillType(FillType.GradientFill);
    } else {
      return getFillType(FillType.ImageFill);
    }
  }

  return PageSidebarDefaultOptions.FillType;
}

export function getSelectedOption(
  options: SelectOption[],
  value: string | number | undefined,
  defaultValue: SelectOption,
): SelectOption {
  if (!value) {
    return defaultValue;
  }

  return options.find((option) => option.value === String(value)) || defaultValue;
}

export function isBgImageHasScale(styles: PebElementStyles): boolean {
  return typeof styles.backgroundSize === 'string'
    && (styles.backgroundSize as string).includes('%');
}

export function getBgScale(styles: PebElementStyles) {
  const bgSize = styles.backgroundSize as string;

  return isBgImageHasScale(styles)
    ? +bgSize.replace(/\%+/, '').trim()
    : PageSidebarDefaultOptions.ImageScale;
}
