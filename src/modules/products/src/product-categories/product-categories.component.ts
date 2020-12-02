import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'peb-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PebProductCategoriesComponent {

  private readonly selectedSubject$ = new BehaviorSubject<string[]>(
    this.data.selectedCategories,
  );
  selected$ = this.selectedSubject$.asObservable();

  set selected(ids: string[]) {
    this.selectedSubject$.next(ids);
  }

  get selected(): string[] {
    return this.selectedSubject$.value;
  }

  multipleSelectedActions: any[] = [
    {
      label: 'Select all',
      callback: () =>
        (this.selected = this.data.products.map((p: any) => p.id)),
    },
    {
      label: 'Deselect all',
      callback: () => (this.selected = []),
    },
    {
      label: 'Apply',
      callback: () => this.onClose(true),
    },
    {
      label: 'Close',
      callback: () => this.onClose(false),
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PebProductCategoriesComponent>,
  ) { }

  onSelectedItemsChanged(items: string[]) {
    this.selected = items;
  }

  onClose(save: boolean) {
    this.dialogRef.close(save ? this.selected : null);
  }

}
