import { Injectable } from '@angular/core';
import { BehaviorSubject, from, merge, ReplaySubject, Subject, Observable } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  retry,
  scan,
  shareReplay,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';

import {
  createInitialShopSnapshot,
  PebAction,
  pebActionHandler,
  PebShopTheme,
  PebShopThemeSnapshot,
} from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import { PebActionResponse } from './interfaces';

export enum PebStateActionType {
  Undo,
  Redo,
}

export enum PebApiActionType {
  Add,
  Delete,
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
export class PebEditorActionService {

  private readonly theme$ = new ReplaySubject<PebShopTheme>(1);
  private readonly lastAction$ = new ReplaySubject<{ type: PebApiActionType, action: PebAction}>();

  private readonly undo$ = new Subject<void>();
  private readonly redo$ = new Subject<void>();
  private readonly createAction$ = new Subject<PebAction>();

  readonly undoRedoState$ = new BehaviorSubject<UndoRedoState>({ canUndo: false, canRedo: false });

  readonly snapshot$ = this.theme$.pipe(
    switchMap(theme => merge(
      from(theme.source.actions),
      this.createAction$,
      this.undo$.pipe(mapTo(PebStateActionType.Undo)),
      this.redo$.pipe(mapTo(PebStateActionType.Redo)),
    ).pipe(
      scan<PebStateActionType | PebAction, PebSnapshotState>((acc, value) => {
        if (value === PebStateActionType.Undo) {
          if (acc.state.length > 1) {
            const state = acc.state.pop();
            this.lastAction$.next({ type: PebApiActionType.Delete, action: state.action });
            acc.redo.push(state);
          }
        } else if (value === PebStateActionType.Redo) {
          if (acc.redo.length > 0) {
            const state = acc.redo.pop();
            this.lastAction$.next({ type: PebApiActionType.Add, action: state.action });
            acc.state.push(state);
          }
        } else {
          acc.redo.length = 0;
          if (acc.state.length === 0) {
            const initialSnapshot = pebActionHandler(createInitialShopSnapshot(), value);
            acc.state.push({ action: value, snapshot: initialSnapshot });
          } else {
            const snapshot = acc.state[acc.state.length - 1].snapshot;
            const updatedSnaphot = pebActionHandler(snapshot, value);
            acc.state.push({
              action: value,
              snapshot: updatedSnaphot,
            });
          }
        }

        this.undoRedoState$.next({ canUndo: acc.state.length > 1, canRedo: acc.redo.length > 0 });

        return acc;
      }, { state: [], redo: [] }),
      map(value => value.state),
      filter(state => state.length > 0),
      map(state => state[state.length - 1]),
    )),
    shareReplay(1),
  );

  readonly activeSnapshot$ = this.snapshot$.pipe(
    map(value => value.snapshot),
    distinctUntilChanged((a, b) => a.hash === b.hash),
  );

  readonly updateBackend$ = merge(
    this.createAction$.pipe(map(action => ({ action, type: PebApiActionType.Add }))),
    this.lastAction$,
  ).pipe(
    withLatestFrom(this.theme$),
    concatMap(([{ type, action }, theme]) => {
      switch (type) {
        case PebApiActionType.Add:
          return this.api.addAction(theme.id, action).pipe(retry(3));
        case PebApiActionType.Delete:
          return this.api.undoAction(theme.id, action.id).pipe(retry(3));
      }
    }),
  );

  readonly activePage$ = this.snapshot$.pipe(
    map(value => value.action.targetPageId),
    shareReplay(),
  );

  constructor(private api: PebEditorApi) {
  }

  openTheme(theme: PebShopTheme): void {
    this.theme$.next(theme);
  }

  createAction(action: PebAction): Observable<PebActionResponse> {
    this.createAction$.next(action);

    return this.snapshot$.pipe(
      filter(value => value.action.id === action.id),
      map(({ snapshot }) => ({ snapshot, progress: 0 })),
      take(1),
    );
  }

  undo(): void {
    this.undo$.next();
  }

  redo(): void {
    this.redo$.next();
  }
}
