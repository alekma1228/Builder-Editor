import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, mergeAll, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import {
  PeDataGridFilter,
  PeDataGridFilterItem,
  PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridSingleSelectedAction,
} from '@pe/data-grid/data-grid.interface';
import { MediaType, PebMediaSidebarCollectionItem } from '@pe/builder-core';
import { MediaService } from '@pe/builder-api';
import { PePlatformHeaderService, PePlatformHeaderConfig } from '@pe/platform-header';

enum FilterKey {
  Category = 'category',
  Style = 'style',
  Format = 'format',
  HasPeople = 'hasPeople',
}

@Component({
  selector: 'peb-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PebMediaComponent implements OnInit, OnDestroy {

  private destroyed$ = new ReplaySubject<boolean>();
  private headerConfig: PePlatformHeaderConfig;

  type: MediaType = MediaType.Images;
  data: PeDataGridItem[] = [];
  sortByOptions: {value: string, name: string}[] = [
    {value: 'popularity', name: 'Popularity'},
    {value: 'relevance', name: 'Relevance'},
  ];

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Select',
    callback: (data: string): void => {
      const { image, id } = this.imageCollection.find((item: {id: string, image: string}) => item.id === data);
      this.platformHeader.closeButtonClicked$.next(true);
      this.dialogRef.close({
        thumbnail: image,
        sourceUrl: id,
      });
    },
  };

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Item',
    descriptionTitle: 'Type',
  };

  filters: PeDataGridFilter[] = [];
  filterItems: PeDataGridFilterItem[] = [];
  page = 1;

  filterSubject$ = new BehaviorSubject<{
    filter: PeDataGridFilterItem[],
    page: number,
  }>({
    filter: [],
    page: 1,
  });
  filter$: Observable<{
    filter: PeDataGridFilterItem[],
    page: number,
  }> = this.filterSubject$.asObservable();

  private imageCollection: PeDataGridItem[] = [];
  public images$: Observable<PeDataGridItem[]>;

  constructor(
    public dialogRef: MatDialogRef<PebMediaComponent>,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
    private platformHeader: PePlatformHeaderService,
  ) { }

  public ngOnInit(): void {
    this.initImageObserable();

    this.images$.pipe(takeUntil(this.destroyed$)).subscribe();

    this.createHeader();
    this.createFilters();
  }

  private initImageObserable(): void {
    this.images$ = this.filter$.pipe(
      map((data) => {
        const hasPeopleFilter = data.filter
          .filter(item => item.key === FilterKey.HasPeople)
          .map(item => {
            return (item.title === 'Include') || !(item.title === 'Exclude')
          })[0];
        return {
          filters: {
            categories: data ? data.filter.filter(item => item.key === 'category')
              .map(item => item.title.toLowerCase()) : [],
            styles: data ? data.filter.filter(item => item.key === 'style').map(item => item.title) : [],
            formats: data ? data.filter.filter(item => item.key === 'format').map(item => item.title) : [],
            hasPeople: hasPeopleFilter === undefined ? true : hasPeopleFilter,
            sortBy: this.sortByOptions[1].value,
          },
          pagination: {
            page: data.page,
            perPage: 52,
          },
        }
      }),
      switchMap(({filters, pagination}) => {
        if (this.type === MediaType.Images) {
          return this.mediaService.getImageCollection(filters, pagination.page, pagination.perPage);
        } else {
          return this.mediaService.getVideoCollection(filters, pagination.page, pagination.perPage);
        }
      }),
      map((data: PebMediaSidebarCollectionItem) => {
        this.imageCollection.push(...data.list.map(item => {
          return {
            id: item.sourceUrl,
            image: item.thumbnail,
          }
        }));
        return [data.list.map(item => {
          return {
            id: item.sourceUrl,
            image: item.thumbnail,
          }
        })]
      }),
      takeUntil(this.destroyed$),
      mergeAll(),
    );
  }

  private createHeader(): void {
    this.headerConfig = this.platformHeader.config;
    this.platformHeader.config$.next({
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: true,
      mainItem: null,
      isShowMainItem: false,
      closeItem: {
        title: 'Close',
        onClick: 'closed',
      },
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
    this.platformHeader?.setShortHeader({
      title: 'Studio',
      icon: 'assets/icons/studio-2.png',
      iconType: 'raster',
      iconSize: '18px',
    });
    this.platformHeader.closeButtonClicked$.asObservable().pipe(
      takeUntil(this.destroyed$),
      tap(() => {
        this.dialogRef.close(null);
      }),
    ).subscribe();
  }

  private createFilters(): void {

    const hasPeople: PeDataGridFilter = {
      title: 'Has People',
      icon: '',
      active: false,
      type: 'radio',
      items: [
        {
          title: 'Include',
          key: FilterKey.HasPeople,
          image: 'assets/icons/includepeople-icon-filter.png',
        },
        {
          title: 'Exclude',
          key: FilterKey.HasPeople,
          image: 'assets/icons/excludepeople-icon-filter.png',
        },
      ],
    };
    this.filters.push(hasPeople);

    this.mediaService.getCategories().pipe(
      takeUntil(this.destroyed$),
      tap((categories: string[]) => {
        if (categories) {
          const filter: PeDataGridFilter = {
            title: 'Category',
            icon: '',
            active: false,
            type: 'checkbox',
            items: categories.map(category => ({
              title: category.charAt(0).toUpperCase() + category.slice(1),
              key: FilterKey.Category,
              image: 'assets/icons/album-icon-filter.png',
            })),
          };
          this.filters.unshift(filter);
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }
      }),
    ).subscribe();

    this.mediaService.getStyles().pipe(
      takeUntil(this.destroyed$),
      tap((styles: string[]) => {
        if (styles) {
          const filter: PeDataGridFilter = {
            title: 'Styles',
            icon: '',
            active: false,
            type: 'checkbox',
            items: styles.map(style => ({
              title: style,
              key: FilterKey.Style,
            })),
          };
          this.filters.push(filter);
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }
      }),
    ).subscribe();

    this.mediaService.getFormats().pipe(
      takeUntil(this.destroyed$),
      tap((formats: string[]) => {
        if (formats) {
          const filter: PeDataGridFilter = {
            title: 'Orientation',
            icon: '',
            active: false,
            type: 'checkbox',
            items: formats.map(format => ({
              title: format,
              key: FilterKey.Format,
              image: `assets/icons/${format.toLowerCase()}-icon-filter.png`,
            })),
          };
          this.filters.push(filter);
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }
      }),
    ).subscribe();
  }

  onFiltersChanged($event: PeDataGridFilterItem[]) {
    this.filterItems = $event;
    this.filterSubject$.next({
      filter: this.filterItems,
      page: 1,
    });
    this.cdr.markForCheck();
  }

  onReachPageEnd($event: number) {
    this.filterSubject$.next({
      filter: this.filterItems,
      page: $event,
    });
    this.cdr.markForCheck();
  }

  search($event: string) {
    this.mediaService.searchMedia($event)
      .pipe(
        takeUntil(this.destroyed$),
      ).subscribe();
  }

  public ngOnDestroy(): void {
    if (this.headerConfig) {
      this.platformHeader.config$.next(this.headerConfig);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
