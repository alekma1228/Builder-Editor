import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { merge, Observable, of } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { MediaType, PebMediaService, PebMediaSidebarCollectionItem } from '@pe/builder-core';
import { PebMediaItem } from '@pe/builder-core';

import { SelectOption } from '../select/select.component';
import { AbstractComponent } from '../../../../../misc/abstract.component';

export interface SelectedMedia {
  source: string;
  preview?: string;
  thumbnail?: string;
}

@Component({
  selector: 'peb-editor-media-tab',
  templateUrl: './media-tab.component.html',
  styleUrls: ['./media-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMediaTabComponent extends AbstractComponent implements OnInit {

  @Input() type: MediaType = MediaType.Images;
  @Output() selected = new EventEmitter<SelectedMedia>();

  sortByOptions: SelectOption[] = [
    { value: 'popularity', name: 'Popularity' },
    { value: 'relevance', name: 'Relevance' },
  ];

  mediaFilterSortForm: FormGroup = new FormGroup({
    sortBy: new FormControl(this.sortByOptions[1]),
    categories: new FormGroup({}),
    peopleExist: new FormControl(true),
    styles: new FormGroup({}),
    formats: new FormGroup({}),
  });

  images$: Observable<PebMediaSidebarCollectionItem> = merge(
    of(this.mediaFilterSortForm.getRawValue()),
    this.mediaFilterSortForm.valueChanges,
  ).pipe(
    map((form) => ({
      categories: Object.keys(form.categories).filter((key) => !!form.categories[key]),
      styles: Object.keys(form.styles).filter((key) => !!form.styles[key]),
      formats: Object.keys(form.formats).filter((key) => !!form.formats[key]),
      hasPeople: !!form.peopleExist,
      sortBy: form.sortBy.value,
    })),
    switchMap(filters => {
      if (this.type === MediaType.Images) {
        return this.mediaService.getImageCollection(filters);
      } else {
        return this.mediaService.getVideoCollection(filters);
      }
    }),
    map(v => v as any), // TODO: Get rid of this
  );

  // TODO: Declare it here similar to 'images$'
  previews$: Observable<PebMediaItem[]>;
  categories$: Observable<string[]>;
  styles$: Observable<string[]>;
  formats$: Observable<string[]>;


  get categoriesForm(): FormGroup {
    return this.mediaFilterSortForm.get('categories') as FormGroup;
  }

  get stylesForm(): FormGroup {
    return this.mediaFilterSortForm.get('styles') as FormGroup;
  }

  get formatsForm(): FormGroup {
    return this.mediaFilterSortForm.get('formats') as FormGroup;
  }

  constructor(
    private mediaService: PebMediaService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.previews$ = this.images$.pipe(
      map(({list}) => list),
      takeUntil(this.destroyed$),
    );

    this.categories$ = this.mediaService.getCategories().pipe(
      tap((categories: string[]) => {
        categories.forEach(category => {
          this.categoriesForm.addControl(category, new FormControl(false));
        });
      }),
      takeUntil(this.destroyed$),
    );

    this.styles$ = this.mediaService.getStyles().pipe(
      tap((styles: string[]) => {
        if (styles) {
          styles.forEach(style => {
            this.stylesForm.addControl(style, new FormControl(false));
          });
        }
      }),
      takeUntil(this.destroyed$),
    );

    this.formats$ = this.mediaService.getFormats().pipe(
      tap((formats: string[]) => {
        formats.forEach(format => {
          this.formatsForm.addControl(format, new FormControl(false));
        });
      }),
      takeUntil(this.destroyed$),
    );
  }

  selectItem(media: any): void {
    const previewUrl = media.type === 'image' ? media.sourceUrl : media.previewUrl;
    this.selected.emit({
      source: media.sourceUrl,
      preview: previewUrl,
    });
  }
}
