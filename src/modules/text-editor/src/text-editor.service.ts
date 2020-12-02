import { Injectable } from '@angular/core';

import { BoldTransform } from './transforms/bold.transform';
import { LinkTransform } from './transforms/link.transform';
import { FontFamilyTransform } from './transforms/font-family.transform';
import { TextJustify, TextLink } from './text-editor.interface';
import { ColorTransform } from './transforms/color.transform';
import { ItalicTransform } from './transforms/italic.transform';
import { UnderlineTransform } from './transforms/underline.transform';
import { StrikeThroughTransform } from './transforms/strike-through.transform';
import { FontSizeTransform } from './transforms/font-size.transform';
import { JustifyTransform } from './transforms/justify.transform';

export interface PebTextEditorStyles {
  link: TextLink,
  fontFamily: string,
  color: string,
  bold: boolean,
  italic: boolean,
  underline: boolean,
  strikeThrough: boolean,
  fontSize: number,
  justify: TextJustify,
}

@Injectable({ providedIn: 'root' })
export class PebTextEditorService {

  iframeDocument: Document;

  get styles(): PebTextEditorStyles {
    return {
      link: this.link,
      fontFamily: this.fontFamily,
      color: this.color,
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      strikeThrough: this.strikeThrough,
      fontSize: this.fontSize,
      justify: this.justify,
    };
  }

  private get link(): TextLink {
    return LinkTransform.get(this.iframeDocument);
  }

  changeLink(value: TextLink) {
    LinkTransform.change(this.iframeDocument, value);
  }

  private get fontFamily(): string {
    return FontFamilyTransform.get(this.iframeDocument);
  }

  changeFontFamily(value: string) {
    FontFamilyTransform.change(this.iframeDocument, value);
  }

  private get color(): string {
    return ColorTransform.get(this.iframeDocument);
  }

  changeColor(value: string) {
    ColorTransform.change(this.iframeDocument, value);
  }

  private get bold(): boolean {
    return BoldTransform.get(this.iframeDocument);
  }

  toggleBold(): void {
    BoldTransform.toggle(this.iframeDocument);
  }

  private get italic(): boolean {
    return ItalicTransform.get(this.iframeDocument);
  }

  toggleItalic(): void {
    ItalicTransform.toggle(this.iframeDocument);
  }

  private get underline(): boolean {
    return UnderlineTransform.get(this.iframeDocument);
  }

  toggleUnderline(): void {
    UnderlineTransform.toggle(this.iframeDocument);
  }

  private get strikeThrough(): boolean {
    return StrikeThroughTransform.get(this.iframeDocument);
  }

  toggleStrikeThrough(): void {
    StrikeThroughTransform.toggle(this.iframeDocument);
  }

  private get fontSize(): number {
    return FontSizeTransform.get(this.iframeDocument);
  }

  changeFontSize(value: number) {
    FontSizeTransform.change(this.iframeDocument, value);
  }

  private get justify(): TextJustify {
    return JustifyTransform.get(this.iframeDocument);
  }

  changeJustify(value: TextJustify): void {
    JustifyTransform.change(this.iframeDocument, value);
  }

}

