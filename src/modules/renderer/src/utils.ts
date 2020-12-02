import { PebElementStyles } from '@pe/builder-core';

export interface BgGradient {
  angle: number;
  startColor: string;
  endColor: string;
}

const BG_GRADIENT = 'linear-gradient';

export function generateObjectHash(object: any) {
  const str = JSON.stringify(object);

  let hash = 0;
  if (str.length === 0) {
    return hash;
  }

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // tslint:disable-next-line:no-bitwise
    hash = ((hash << 5) - hash) + char;
    // tslint:disable-next-line:no-bitwise
    hash = hash & hash;
  }
  return hash;
}

export function getBackgroundImage(backgroundImage: string): string {
  if (!backgroundImage) {
    return null;
  }
  return backgroundImage.includes(BG_GRADIENT)
    ? backgroundImage
    : 'url("' + backgroundImage + '")';
}

export function isBackgroundGradient(backgroundImage: string): boolean {
  const bgImg = backgroundImage || '';

  return bgImg.includes(BG_GRADIENT);
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
