import { Observable } from 'rxjs';

import ResizeObserver from 'resize-observer-polyfill';

// TODO: January 2021 remove polyfill since it won't be needed anymore
export function fromResizeObserver(element: HTMLElement): Observable<Partial<DOMRectReadOnly>> {
  return new Observable((observer) => {
    const resizeObserver = new ResizeObserver(entry => {
      observer.next(entry[0].contentRect);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  });
}
