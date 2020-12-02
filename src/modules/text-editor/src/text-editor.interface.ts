import { PebInteractionWithPayload } from '@pe/builder-core';

export interface Transform {
  getValue(doc: Document): string | number | boolean | TextLink | TextJustify;
}

export enum ExecCommand {
  CreateLink = 'createLink',
  Unlink = 'unlink',
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  FontName = 'fontName',
  FontSize = 'fontSize',
  ForeColor = 'foreColor',
  InsertHTML = 'insertHTML',
  InsertText = 'insertText',
  JustifyLeft = 'justifyLeft',
  JustifyRight = 'justifyRight',
  JustifyCenter = 'justifyCenter',
  JustifyFull = 'justifyFull',
  InsertOrderedList = 'insertOrderedList',
  InsertUnorderedList = 'insertUnorderedList',
  StrikeThrough = 'strikeThrough',
}

export interface EditorSelection {
  start: number;
  end: number;
  range: Range;
  container: Element,
  parentElement: HTMLElement;
}

export interface EditorSelection {
  start: number;
  end: number;
  range: Range;
  container: Element;
  parentElement: HTMLElement;
}

export type TextLink = PebInteractionWithPayload<string>;

export enum TextJustify {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Full = 'full',
}
