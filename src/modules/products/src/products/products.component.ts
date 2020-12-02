import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PeDataGridSingleSelectedAction } from '@pe/data-grid';

@Component({
  selector: 'peb-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebProductsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PebProductsComponent>,
  ) {}

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

  sortByActions: any[] = [
    {
      label: 'Name',
      callback: () => console.log('sort by name'),
    },
    {
      label: 'Price: Ascending',
      callback: () => console.log('sort by price: asc'),
    },
    {
      label: 'Price: Descending',
      callback: () => console.log('sort by price des'),
    },
    {
      label: 'Date',
      callback: () => console.log('sort by date'),
    },
  ];

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Select',
    callback: (data: string) => {
      this.dialogRef.close([data]);
    },
  };


  private readonly selectedSubject$ = new BehaviorSubject<string[]>(
    this.data.selectedProducts,
  );
  selected$ = this.selectedSubject$.asObservable();

  set selected(ids: string[]) {
    this.selectedSubject$.next(ids);
  }

  get selected(): string[] {
    return this.selectedSubject$.value;
  }

  onSelectedItemsChanged(items: string[]) {
    this.selected = items;
  }

  onSearchChanged(value: string) {}

  onClose(save: boolean) {
    this.dialogRef.close(save ? this.selected : null);
  }
}
