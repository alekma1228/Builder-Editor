import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';

import {
  pebCreateLogger,
  PebElementStyles,
  PEB_DEFAULT_FONT_FAMILY,
} from '@pe/builder-core';

import { SidebarSelectOption } from './../_inputs/select/select.input';
import { PebEditorState } from '../../../services/editor.state';
import { PebEditorStore } from '../../../services/editor.store';
import { PebEditorElement } from '../../../renderer/editor-element';

const log = pebCreateLogger('editor:behaviors:edit-products');

const DEFAULT_TITLE_COLOR = '#000';
const DEFAULT_PRICE_COLOR = '#a5a5a5';
const DEFAULT_TITLE_FONT_WEIGHT = 'bold';
const DEFAULT_PRICE_FONT_WEIGHT = 'normal';
const DEFAULT_FONT_SIZE = 13;

export enum ProductsFontTypes {
  Title = 'title',
  Price = 'price',
}

const DEFAULT_COLORS = {
  [ProductsFontTypes.Title]: DEFAULT_TITLE_COLOR,
  [ProductsFontTypes.Price]: DEFAULT_PRICE_COLOR,
};

const DEFAULT_FONT_WEIGHTS = {
  [ProductsFontTypes.Title]: DEFAULT_TITLE_FONT_WEIGHT,
  [ProductsFontTypes.Price]: DEFAULT_PRICE_FONT_WEIGHT,
};

export interface Font {
  initialValue: {
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    fontSize: number;
    color: string;
  };
  form: FormGroup;
  options: {
    fontFamilies: SidebarSelectOption[];
    type: ProductsFontTypes;
  };
  update: () => void;
  submit: Subject<any>;
}

@Injectable({ providedIn: 'any' })
export class ProductsFontBehavior {
  logger = { log };

  constructor(
    private formBuilder: FormBuilder,
    private state: PebEditorState,
    private store: PebEditorStore,
  ) {}

  private mapFontStyles(
    styles: PebElementStyles,
    prefix: string,
  ): PebElementStyles {
    return {
      fontFamily: styles[prefix + 'FontFamily'] as string,
      fontWeight: styles[prefix + 'FontWeight'] as string,
      fontStyle: styles[prefix + 'FontStyle'] as string,
      textDecoration: styles[prefix + 'TextDecoration'] as string,
      fontSize: styles[prefix + 'FontSize'] as number,
      color: styles[prefix + 'Color'] as string,
    };
  }

  private mapFontStylesForElement(
    styles: PebElementStyles,
    prefix: string,
  ): PebElementStyles {
    return {
      [prefix + 'FontFamily']: styles.fontFamily as string,
      [prefix + 'FontWeight']: styles.fontWeight as string,
      [prefix + 'FontStyle']: styles.fontStyle as string,
      [prefix + 'TextDecoration']: styles.textDecoration as string,
      [prefix + 'FontSize']: styles.fontSize as number,
      [prefix + 'Color']: styles.color as string,
    };
  }

  initProductFontForm(styles: PebElementStyles, type: ProductsFontTypes): Font {
    const mappedStyles = this.mapFontStyles(styles, type);
    const initialValue = {
      fontFamily:
        (mappedStyles.fontFamily as string) ?? PEB_DEFAULT_FONT_FAMILY,
      fontWeight:
        (mappedStyles.fontWeight as string) ?? DEFAULT_FONT_WEIGHTS[type],
      fontStyle: mappedStyles.fontStyle as string,
      textDecoration: mappedStyles.textDecoration as string,
      fontSize: (mappedStyles.fontSize as number) ?? DEFAULT_FONT_SIZE,
      color: (mappedStyles.color as string) ?? DEFAULT_COLORS[type],
    };

    return {
      initialValue,
      options: {
        // TODO: create a constant
        fontFamilies: [
          { label: 'Roboto', value: 'Roboto' },
          { label: 'Montserrat', value: 'Montserrat' },
          { label: 'PT Sans', value: 'PT Sans' },
          { label: 'Lato', value: 'Lato' },
          { label: 'Space Mono', value: 'Space Mono' },
          { label: 'Work Sans', value: 'Work Sans' },
          { label: 'Rubik', value: 'Rubik' },
        ],
        type,
      },
      form: this.formBuilder.group({
        fontFamily: [initialValue.fontFamily],
        fontWeight: [initialValue.fontWeight],
        fontStyle: [initialValue.fontStyle],
        textDecoration: [initialValue.fontStyle],
        fontSize: [
          initialValue.fontSize,
          [Validators.min(1), Validators.max(100)],
        ],
        color: [initialValue.color],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  handleProductFontForm(
    elementCmp: PebEditorElement,
    font: Font,
  ): Observable<any> {
    const elDef = elementCmp.definition;

    return merge(
      font.form.valueChanges.pipe(
        tap(changes => {
          const mappedFontElementStyles = this.mapFontStylesForElement(
            changes,
            font.options.type,
          );

          if (font.form.invalid) {
            this.logger.log('Font: Change: Invalid');
            return;
          }

          this.logger.log('Font: Change: Valid ', mappedFontElementStyles);

          elementCmp.styles = {
            ...elementCmp.styles,
            ...mappedFontElementStyles,
          };

          elementCmp.detectChanges();
          elementCmp.applyStyles();
        }),
      ),
      font.submit.pipe(
        switchMap(() => {
          const mappedFontElementStyles = this.mapFontStylesForElement(
            font.form.value,
            font.options.type,
          );
          if (
            font.form.invalid ||
            isEqual(font.initialValue, mappedFontElementStyles)
          ) {
            return EMPTY;
          }

          this.logger.log('Font: Submit ', mappedFontElementStyles);

          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: mappedFontElementStyles,
          });
        }),
      ),
    );
  }
}
