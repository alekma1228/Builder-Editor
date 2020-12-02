import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { FormGroup } from '@angular/forms';
import { chunk } from 'lodash';

export const BG_GRADIENT = 'linear-gradient';

export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];

export function hexToRgba(hexString: string, opacity: number) {
  const arr = chunk(hexString.replace('#', '').split(''), 2);
  return `rgba(${arr.reduce((acc, elem) => {
    return acc + parseInt(elem.join(''), 16) + ', ';
  }, '')}${opacity / 100})`;
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function isBackgroundGradient(backgroundImage?: string, form?: FormGroup): boolean {
  let bgImg = '';
  if (backgroundImage) {
    bgImg = backgroundImage;
  } else if (form && form.get('bgImage')) {
    bgImg = form.get('bgImage').value;
  }

  return bgImg.includes(BG_GRADIENT);
}

export const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});
