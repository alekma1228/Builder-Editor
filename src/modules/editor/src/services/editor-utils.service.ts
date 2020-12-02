import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

import { PebPageId, PebScreen, PebShopThemeSnapshot } from '@pe/builder-core';

import { ContextBuilder } from './context.service';
import { PageSnapshot } from '../root/abstract-editor';

@Injectable({ providedIn: 'any' })
export class PebEditorUtilsService implements OnDestroy {

  private readonly destroyedSubject$ = new Subject();
  readonly destroyed$ = this.destroyedSubject$.asObservable();

  constructor(
    private contextManager: ContextBuilder,
  ) {}

  ngOnDestroy() {
    this.destroyedSubject$.next(true);
    this.destroyedSubject$.complete();
  }

  constructPageSnapshot(
    snapshot$: Observable<PebShopThemeSnapshot>,
    pageId$: Observable<PebPageId>,
    screen$: Observable<PebScreen>,
    refresh$: BehaviorSubject<null>,
  ): Observable<PageSnapshot> {
    return combineLatest([
      snapshot$.pipe(filter(s => Boolean(s))),
      pageId$,
      screen$,
      refresh$,
    ]).pipe(
      map((result) => {
        const [snapshot, activePageId, screen] = result;

        if (!activePageId) {
          return null;
        }

        const page = snapshot.pages[activePageId];
        if (!page) {
          // This page is not exist
          return null;
        }
        return {
          id: page.id,
          name: page.name,
          variant: page.variant,
          type: page.type,
          data: page.data,
          template: snapshot.templates[page.templateId],
          stylesheet: snapshot.stylesheets[page.stylesheetIds[screen]],
          contextSchema: {
            ...snapshot.contextSchemas[page.contextId],
            // Add global shop context
            ...snapshot.contextSchemas[snapshot.shop.contextId],
          },
        }
      }),
      distinctUntilChanged(),
      switchMap(snapshot => {
        return snapshot
          ? this.contextManager.buildSchema(snapshot.contextSchema).pipe(
            map(context => ({
              ...snapshot,
              context,
            })),
          )
          : EMPTY;
      }),
      map(v => v as PageSnapshot),
    )
  }
}
