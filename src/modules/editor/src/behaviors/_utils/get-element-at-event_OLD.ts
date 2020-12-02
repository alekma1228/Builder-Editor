/** @deprecated */
export function getElementAtEvent_OLD(evt: Event): HTMLElement {
  const els = evt.composedPath()
    .filter(el => el !== window && el !== document)
    .filter(el => (el as HTMLElement).tagName && (el as HTMLElement).tagName.toLowerCase().startsWith('peb-element'));

  return els[0] as HTMLElement;
}

/** @deprecated */
export function getMakerAtEvent_OLD(evt: Event): HTMLElement {
  const els = evt.composedPath()
    .filter(el => el !== window && el !== document)
    .filter(el => (el as HTMLElement).tagName && (el as HTMLElement).tagName.toLowerCase().startsWith('peb-maker'));

  return els[0] as HTMLElement;
}
