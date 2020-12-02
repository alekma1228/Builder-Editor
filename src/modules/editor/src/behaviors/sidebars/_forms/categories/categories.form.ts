import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { SelectOption } from "../../_deprecated-sidebars/shared/select/select.component";
import { CategoryType, CategoryTypeOptions } from "./categories.form.constants";
import { MatDialog } from "@angular/material/dialog";
import { PebProductCategoriesComponent } from "@pe/builder-products";
import { PebProductsApi, PebProductCategory } from "@pe/builder-api";
import { filter, switchMap, tap } from "rxjs/operators";

@Component({
  selector: 'editor-categories-form',
  templateUrl: './categories.form.html',
  styleUrls: ['./categories.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorCategoriesForm {

  @Input() formGroup: FormGroup;
  @Output() blurred = new EventEmitter();

  categoryType = CategoryType;
  categoryTypeOptions: SelectOption[] = CategoryTypeOptions;

  constructor(
    private dialog: MatDialog,
    private productApi: PebProductsApi,
  ) {
  }

  addCategories() {
    this.productApi.getProductsCategories().pipe(
      switchMap((categories: PebProductCategory[]) => {
        const dialog = this.dialog.open(PebProductCategoriesComponent, {
          position: {
            top: '0',
            left: '0',
          },
          height: '100vh',
          maxWidth: '100vw',
          width: '100vw',
          panelClass: 'products-dialog',
          data: {
            categories,
            selectedCategories: this.formGroup.get('categories')?.value || [],
          }
        });
        return dialog.afterClosed().pipe(
          filter(Boolean),
          tap((ids: string[]) => {
            const categoriesDict = categories.reduce((acc, category) => {
              acc[category.id] = category;
              return acc;
            }, {});
            this.formGroup.get('categories').patchValue(ids.map(id => categoriesDict[id]));
            this.blurred.emit();
          }),
        );
      }),
    ).subscribe();

  }

  removeCategory(id: string) {
    const control = this.formGroup.get('categories');
    control.patchValue(control.value.filter(category => category.id !== id));
    this.blurred.emit();
  }
}
