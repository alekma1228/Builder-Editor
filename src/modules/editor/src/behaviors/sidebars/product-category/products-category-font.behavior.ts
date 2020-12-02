
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
import { FontFamilies } from '../../../misc/constants/font.constants';

const log = pebCreateLogger('editor:behaviors:edit-category');

const DEFAULT_COLOR = '#000';
const DEFAULT_CATEGORY_TITLE_FONT_SIZE = 40;
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_FONT_WEIGHT = 'normal'

export enum CategoryFontTypes {
  ProductTitle = 'title',
  ProductPrice = 'price',
  CategoryTitle = 'categoryTitle',
  CategoryFilter = 'filter',
}

const DEFAULT_FONT_SIZES = {
  [CategoryFontTypes.ProductTitle]: DEFAULT_FONT_SIZE,
  [CategoryFontTypes.ProductPrice]: DEFAULT_FONT_SIZE,
  [CategoryFontTypes.CategoryFilter]: DEFAULT_FONT_SIZE,
  [CategoryFontTypes.CategoryTitle]: DEFAULT_CATEGORY_TITLE_FONT_SIZE,
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
    type: CategoryFontTypes;
  };
  update: () => void;
  submit: Subject<any>;
}

@Injectable({ providedIn: 'any' })
export class CategoryFontBehavior {
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

  initCategoryFontForm(styles: PebElementStyles, type: CategoryFontTypes): Font {
    const mappedStyles = this.mapFontStyles(styles, type);
    const initialValue = {
      fontFamily:
        (mappedStyles.fontFamily as string) ?? PEB_DEFAULT_FONT_FAMILY,
      fontWeight:
        (mappedStyles.fontWeight as string) ?? DEFAULT_FONT_WEIGHT,
      fontStyle: mappedStyles.fontStyle as string,
      textDecoration: mappedStyles.textDecoration as string,
      fontSize: (mappedStyles.fontSize as number) ?? DEFAULT_FONT_SIZES[type],
      color: (mappedStyles.color as string) ?? DEFAULT_COLOR,
    };

    return {
      initialValue,
      options: {
        fontFamilies: FontFamilies,
        type,
      },
      form: this.formBuilder.group({
        fontFamily: [initialValue.fontFamily],
        fontWeight: [initialValue.fontWeight],
        fontStyle: [initialValue.fontStyle],
        textDecoration: [initialValue.textDecoration],
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

  handleCategoryFontForm(
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
