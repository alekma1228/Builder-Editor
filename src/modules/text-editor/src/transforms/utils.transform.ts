export function RGBToHex(rgb: string): string {
  if (!rgb) {
    return null;
  }

  const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  const result = rgb.substr(4).split(')')[0].split(sep);

  let r = (+result[0]).toString(16);
  let g = (+result[1]).toString(16);
  let b = (+result[2]).toString(16);

  if (r.length === 1)
    r = '0' + r;
  if (g.length === 1)
    g = '0' + g;
  if (b.length === 1)
    b = '0' + b;

  return '#' + r + g + b;
}

export function getParentElementByTag(doc: Document, tag: string): HTMLElement {
  let parentEl = null;
  const sel = doc.getSelection();

  if (sel?.rangeCount) {
    parentEl = sel.getRangeAt(0).commonAncestorContainer;

    if (parentEl.nodeType !== 1) {
      parentEl = parentEl.parentNode;
    }
  }

  while (parentEl) {
    if (parentEl.nodeName === tag.toUpperCase()) {
      break;
    }

    parentEl = parentEl.parentNode;
  }

  return parentEl;
}
