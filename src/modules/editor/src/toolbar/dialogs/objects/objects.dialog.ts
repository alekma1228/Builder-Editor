import { Component, Inject } from '@angular/core';

import { PebShapeVariant } from '@pe/builder-renderer';
import { PebElementType } from '@pe/builder-core';

import { OverlayData, OVERLAY_DATA } from '../../overlay.data';

enum Categories {
  Objects = 'Objects',
  Buttons = 'Buttons',
  Menu = 'Menu',
  // Disable these categories
  // Map = 'Map',
  // Search = 'Search',
  Cart = 'Cart',
  Misc = 'Misc',
}

const OBJECT_CATEGORIES: {[index in Categories]: ObjectCategory[]} = {
  [Categories.Objects]: [
    ...Object
      .values(PebShapeVariant)
      .map<ObjectCategory>((shape: string) => ({ variant: shape, type: PebElementType.Shape })),
    // { variant: PebElementType.Line, type: PebElementType.Line } as any,
  ],
  [Categories.Buttons]: [
    {
      variant: PebElementType.Button,
      type: PebElementType.Button,
      style: {
        borderRadius: '0',
      },
    },
    {
      variant: PebElementType.Button + '--rounded',
      type: PebElementType.Button,
      style: {
        borderRadius: '15',
      },
    },
  ],
  [Categories.Menu]: [
    {
      variant: PebElementType.Menu,
      type: PebElementType.Menu,
      icon: 'menu',
    },
  ],
  [Categories.Cart]: [
    { variant: PebElementType.Cart, type: PebElementType.Cart },
  ],
  [Categories.Misc]: [
    { variant: PebElementType.Logo, type: PebElementType.Logo },
  ],
}

export interface ObjectCategory {
  type: PebElementType;
  variant?: string;
  style?: any;
  icon?: string;
  data?: any;
  setAfter?: boolean;
}

interface Category {
  name: string;
  objects: ObjectCategory[];
}

@Component({
  selector: 'peb-editor-objects-dialog',
  templateUrl: 'objects.dialog.html',
  styleUrls: ['./objects.dialog.scss'],
})
export class PebEditorObjectsDialogComponent {
  readonly categories: Category[] = Object.keys(Categories)
    .map((category: Categories) => {
      return {
        name: category,
        objects: OBJECT_CATEGORIES[category],
      };
    });

  searchObject = '';
  selectedCategory: Category = this.categories[0];

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
  ) {}

  onSearchObject(searchValue: string): void {
    // TODO: Implement searching objects by `searchValue`
  }

  choseCategory(category: Category): void {
    this.selectedCategory = category;
  }

  addObject(objectCategory: ObjectCategory): void {
    this.data.emitter.next(objectCategory);
  }
}
