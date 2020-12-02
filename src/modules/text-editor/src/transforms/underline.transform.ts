import { ExecCommand } from '../text-editor.interface';
import { getParentElementByTag } from './utils.transform';
import { unsetLink } from './link.transform';

export const UnderlineTransform = {
  toggle: (doc: Document) => {
    doc.execCommand(ExecCommand.Underline);
    const parentUnderline = getParentElementByTag(doc, 'U');
    const parentLink = getParentElementByTag(doc, 'A');

    !parentUnderline ? doc.execCommand(ExecCommand.Unlink) : null;
    if (parentLink) {
      parentLink.style.setProperty('color', 'inherit');
      parentLink.style.setProperty('text-decoration', 'none');
    }
    
  },
  get: (doc: Document) => doc.queryCommandState(ExecCommand.Underline),
}
