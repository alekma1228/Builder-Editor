import { Observable } from 'rxjs';

declare const ResizeObserver;

/**
 *  TODO: This function is a duplicate of the same function in editor, viewer and themes.
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
