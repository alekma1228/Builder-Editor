import { PebInteractionType, PebLinkDatasetLink } from '@pe/builder-core';

import { ExecCommand, TextLink } from '../text-editor.interface';
import { getParentElementByTag } from './utils.transform';

function setLink(doc: Document, value: TextLink) {
  let parentLink = getParentElementByTag(doc, 'A');

  if (!parentLink) {
    doc.execCommand(ExecCommand.Underline);
    doc.execCommand(ExecCommand.CreateLink, false, '#');
    parentLink = getParentElementByTag(doc, 'A');
  }

  parentLink.style.setProperty('color', 'inherit');
  // parentLink.style.setProperty('text-decoration', 'none');
  parentLink.setAttribute(PebLinkDatasetLink.type, value.type);
  parentLink.setAttribute(PebLinkDatasetLink.payload, value.payload);
}

export function unsetLink(doc: Document): void {
  doc.execCommand(ExecCommand.Unlink);
  const parentUnderline = getParentElementByTag(doc, 'U');
  
  if (parentUnderline) {
    doc.execCommand(ExecCommand.Underline)
  }

  // https://bugs.webkit.org/show_bug.cgi?id=21680
  Array.from(getParentElementByTag(doc, 'FONT')
    ?.parentNode
    .querySelectorAll('font'))
    .filter((e: any) => e.color === 'rgba(0, 0, 0, 0)')
    .forEach(e => {
      e.insertAdjacentHTML('afterend', e.innerHTML);
      e.parentNode.removeChild(e);
    });
}

export const LinkTransform = {
  change: (doc: Document, value: TextLink) => value ? setLink(doc, value) : unsetLink(doc),
  get: (doc: Document): TextLink | null => {
    let parentElement = getParentElementByTag(doc, 'A');

    while (parentElement && !parentElement.getAttribute(PebLinkDatasetLink.type)) {
      parentElement = parentElement.parentElement;
    }

    if (!parentElement?.getAttribute(PebLinkDatasetLink.type)) {
      return null;
    }

    return {
      type: parentElement.getAttribute(PebLinkDatasetLink.type) as PebInteractionType,
      payload: parentElement.getAttribute(PebLinkDatasetLink.payload),
    };
  },
};
