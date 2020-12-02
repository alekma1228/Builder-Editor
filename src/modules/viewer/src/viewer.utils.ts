import { Location } from '@angular/common';
import { Observable, ReplaySubject } from 'rxjs';

import { PebPage, PebPageVariant, PebScreen, PebShop } from '@pe/builder-core';

import { ScreenThresholds } from './viewer.constants';
import { OnDestroy } from '@angular/core';

declare const ResizeObserver;

/**
 *  TODO: This function is a duplicate of the same function in editor.
 *        If we would have more functions like there would be a reason to consider
 *        introducing `@pe/utils` package.
 */
export function fromResizeObserver(element: HTMLElement): Observable<DOMRectReadOnly> {
  if (!ResizeObserver.__zone_symbol__OriginalDelegate) {
    console.warn(
      'You are using ResizeObserver without zone.js patching.\n',
      'Events thrown by it won\'t be detected by Angular. Most likely this is not what you want.',
    );
  }

  return new Observable((observer) => {
    const resizeObserver = new ResizeObserver(entry => {
      observer.next(entry[0].contentRect);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  });
}

export function fromLocationUrlChange(location: Location) {
  return new Observable((observer) => {
    // FIXME: Unsubscribe from "sub"
    location.onUrlChange(evt => observer.next(evt));

    return () => {}
  })
}

export const screenFromWidthFactory = (thresholds: ScreenThresholds) => (width: number): PebScreen => {
  const result = Object.entries(thresholds).find(([screen, [min, max]]) => {
      return width >= min && width < max;
    },
  );

  if (!result) {
    console.warn(
      `Width ${width} doesn't map to any screen with current thresholds configuration.\n` +
      'Make sure it is correct. Used minimal screen possible',
    )
    return PebScreen.Mobile;
  }

  return result[0] as PebScreen;
};

export function getThemePageByLocation(theme: PebShop, location: string): PebPage {
  const productPageMatcher = createPathPatternMatcher(theme.data?.productPages, ['productId']);
  const categoryPageMatcher = createPathPatternMatcher(theme.data?.categoryPages, ['categoryId']);
  // front page
  if (location === '/') {
    return theme.pages.find(page => page.variant === PebPageVariant.Front);
  }

  const route = theme.routing.find(r => r.url === location);

  // direct match
  if (route) {
    return theme.pages.find(page => page.id === route.pageId);
  }

  // product page
  if (productPageMatcher(location)) {
    return theme.pages.find(page => page.variant === PebPageVariant.Product);
  }

  // category page
  if (categoryPageMatcher(location)) {
    return theme.pages.find(page => page.variant === PebPageVariant.Category);
  }

  // not found
  return null;
}

function createPathPatternMatcher (pattern: string, params: string[]) {
  if (!pattern) {
    return null;
  }

  const patternParts = pattern.replace(/^\//, '').split('/');

  return (path: string): null|any => {
    const pathParts = path.replace(/^\//, '').split('/');
    const match = Object.assign({}, ...params.map(v => ({ [v]: null }) ));

    for (const i in patternParts) {
      if (!pathParts[i]) {
        return null;
      }

      if (params.includes(patternParts[i].replace(/^:/, ''))) {
        match[patternParts[i].replace(/^:/, '')] = pathParts[i];
        continue;
      }

      if (patternParts[i] === pathParts[i]) {
        continue;
      }

      return null;
    }

    return match;
  }
}

export abstract class AbstractComponent implements OnDestroy {

  protected destroyed$ = new ReplaySubject<boolean>();

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
