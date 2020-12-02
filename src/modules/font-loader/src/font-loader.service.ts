import { Injectable } from '@angular/core';
import * as WebFont from 'webfontloader';

@Injectable({ providedIn: 'root' })
export class FontLoaderService {
  constructor() {
    this.registerInitialFonts();
  }
  private registerInitialFonts() {
    const fonts = [
      'Roboto:400,700',
      'Montserrat:400,700',
      'PT Sans:400,700',
      'Lato:400,700',
      'Space Mono:400,700',
      'Work Sans:400,700',
      'Rubik:400,700'
    ];
    localStorage.setItem('fonts', JSON.stringify(fonts));
  }
  public renderFontLoader(context = null) {
    const fonts = this.getFonts();
    if (!fonts) {
      return
    }
    if (fonts.length > 0) {
      WebFont.load({
        google: {
          families: fonts
        },
        context: context
      });
    }
  }

  private getFonts(): string[] {
    return JSON.parse(localStorage.getItem('fonts') ?? '[]');
  }

  public registerFont(newFont: string) {
    const fonts = this.getFonts();
    if (!fonts) {
      return
    }

    if (!fonts.includes(newFont+':400,700')) {
      fonts.push(newFont+':400,700');
    }
    localStorage.setItem('fonts', JSON.stringify(fonts));
    this.renderFontLoader();
  }
}