import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, first, map, retry, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import {
  PebAction,
  pebActionHandler,
  pebCompileActions,
  PebShopThemeSnapshot,
  PebTheme,
} from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { PebEditorCompileErrorDialog } from '../toolbar/dialogs/compile-error/compile-error.dialog';

export enum PebStateActionType {
  Undo,
  Redo,
}

export enum PebApiActionType {
  Add = 'add',
  Delete = 'delete',
}

export interface PebSnapshotItem {
  action: PebAction;
  snapshot: PebShopThemeSnapshot;
}

export interface PebSnapshotState {
  state: PebSnapshotItem[];
  redo: PebSnapshotItem[];
}

export  interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
}

@Injectable()
export class PebEditorThemeService implements OnDestroy {

  private readonly destroyedSubject$ = new Subject();

  readonly destroyed$ = this.destroyedSubject$.asObservable();

  private readonly themeSubject$ = new BehaviorSubject<PebTheme>(null);

  get theme$(): Observable<PebTheme> {
    return this.themeSubject$.asObservable();
  }

  get theme(): PebTheme {
    return this.themeSubject$.value;
  }

  private readonly snapshotSubject$ = new BehaviorSubject<PebShopThemeSnapshot>(null);

  get snapshot$(): Observable<PebShopThemeSnapshot> {
    return this.snapshotSubject$.asObservable();
  }

  get snapshot(): PebShopThemeSnapshot {
    return this.snapshotSubject$.value;
  }

  private readonly actionsSubject$ = new BehaviorSubject<PebAction[]>([]);

  get actions(): PebAction[] {
    return this.actionsSubject$.value;
  }

  private readonly canceledActionsSubject$ = new BehaviorSubject<PebAction[]>([]);

  get canUndo$(): Observable<boolean> {
    return this.actionsSubject$.asObservable().pipe(map(actions => actions.length > 1));
  }

  get canRedo$(): Observable<boolean> {
    return this.canceledActionsSubject$.asObservable().pipe(map(actions => !!actions.length));
  }

  private get canUndo(): boolean {
    return this.actionsSubject$.value.length > 1;
  }

  private get canRedo(): boolean {
    return !!this.canceledActionsSubject$.value.length;
  }

  /**
   * We need a queue because this solves the problem of cancelling multiple requests by Google Chrome.
   * The problem will need to be solved later with web sockets.
   */
  private readonly requestsQueueSubject$ = new BehaviorSubject<{id: string, request: Observable<any>}[]>([]);

  private addRequestToQueue(id: string, request: Observable<any>) {
    this.requestsQueueSubject$.next([
      ...this.requestsQueueSubject$.value,
      { id, request },
    ]);
  }

  private removeRequestFromQueue(id: string) {
    this.requestsQueueSubject$.next([
      ...this.requestsQueueSubject$.value.filter(r => r.id !== id),
    ]);
  }

  constructor(
    private api: PebEditorApi,
    private dialog: MatDialog,
  ) {
    this.requestsQueueSubject$.pipe(
      distinctUntilChanged(),
      debounceTime(100),
      filter(requests => !!requests?.length),
      tap(requests => requests.forEach(r => this.removeRequestFromQueue(r.id))),
      switchMap(requests => forkJoin(requests.map(r => r.request))),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroyedSubject$.next(true);
    this.destroyedSubject$.complete();
  }

  openTheme(theme: PebTheme, snapshot: PebShopThemeSnapshot): void {
    this.themeSubject$.next(theme);
    this.snapshotSubject$.next(snapshot);

    this.api.getActions(theme.id).pipe(
      first(),
      tap(actions => this.actionsSubject$.next(actions)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  commitAction(action: PebAction): Observable<null> {

    console.log('COMMIT ACTION: ', action);

    // TODO: Add hash comparing
    this.snapshotSubject$.next(pebActionHandler(this.snapshot, action));
    this.actionsSubject$.next([...this.actionsSubject$.value, action]);

    this.addRequestToQueue(
      action.id,
      this.api.addAction(this.theme.id, action).pipe(retry(3)).pipe(
        catchError((_, data) => {
          this.dialog.open(PebEditorCompileErrorDialog, { disableClose: true });
          return data;
        }),
      ),
    );
    this.canceledActionsSubject$.next([]);
    return of(null);
  }

  undo(): Observable<void> {

    if (!this.canUndo) {
      return;
    }

    const actions = this.actionsSubject$.value;
    const action = actions.pop();

    this.snapshotSubject$.next(pebCompileActions(actions));

    this.actionsSubject$.next(actions);
    this.canceledActionsSubject$.next([...this.canceledActionsSubject$.value, action]);

    this.addRequestToQueue(
      action.id,
      this.api.undoAction(this.theme.id, action.id),
    );

    return of(null);
  }

  redo(): Observable<void> {

    if (!this.canRedo) {
      return;
    }

    const canceledActions = this.canceledActionsSubject$.value;
    const action = canceledActions.pop();

    this.snapshotSubject$.next(pebActionHandler(this.snapshot, action));

    this.actionsSubject$.next([...this.actionsSubject$.value, action]);
    this.canceledActionsSubject$.next(canceledActions);

    this.addRequestToQueue(
      action.id,
      this.api.addAction(this.theme.id, action),
    );

    return of(null);
  }

  updatePreview(previewURL: string): Observable<void> {
    return this.api.updateShopThemePreview(this.theme.id, previewURL).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        picture: previewURL,
      })),
    );
  }

  updatePagePreview(pageId: string, previewUrl: string, actionId: string): Observable<void> {
    const previews = {
      ...this.theme.source.previews,
      [pageId]: {
        previewUrl,
        actionId,
      },
    };

    return this.api.updateThemeSourcePagePreviews(this.theme.id, this.theme.source.id, previews).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        source: {
          ...this.theme.source,
          previews,
        },
      })),
    );
  }

  updateThemeName(name: string): Observable<void> {
    return this.api.updateShopThemeName(this.theme.id, name).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        name,
      })),
    );
  }
}
