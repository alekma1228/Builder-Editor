import { ExecCommand } from '../text-editor.interface';
import { getParentElementByTag } from './utils.transform';
import { PEB_FONT_SIZE_ATTRIBUTE } from '@pe/builder-core';

export const FontSizeTransform = {
  change: (doc: Document, value: number) => {
    doc.execCommand(ExecCommand.FontSize, false, '1');
    let parentNode: HTMLElement = getParentElementByTag(doc, 'FONT');

    const sel = doc.getSelection();

    if (sel.focusNode.nodeName === 'BODY') {
      return
    }
    if (!parentNode) {
      if (!sel?.rangeCount) {
        return;
      }

      const font = document.createElement('FONT');
      const range = sel.getRangeAt(0);
      font.appendChild(range.extractContents());
      range.insertNode(font);

      parentNode = font;
    }

    parentNode.removeAttribute('size');
    parentNode.style.fontSize = `${value}px`;
    parentNode.setAttribute(PEB_FONT_SIZE_ATTRIBUTE, `${value}`)

    const fontElements = Array.from(parentNode.querySelectorAll('font'));
    fontElements.forEach(el => {
      if (el.getAttribute('size') !== '1') {
        return;
      }
      el.removeAttribute('size');
      el.style.fontSize = `${value}px`;
      el.setAttribute(PEB_FONT_SIZE_ATTRIBUTE, `${value}`)
    });
  },
  get: (doc: Document) => {
    const font = getParentElementByTag(doc, 'FONT');

    if (!font) {
      return parseInt(doc.body.style.fontSize, 10);
    }

    if (font.hasAttribute(PEB_FONT_SIZE_ATTRIBUTE)) {
      return parseInt(font.getAttribute(PEB_FONT_SIZE_ATTRIBUTE));
    }

    return font?.style?.fontSize ? parseInt(font.style.fontSize, 10) : null;
  },
};
