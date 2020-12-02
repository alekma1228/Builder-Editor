import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PebScreen, PebShopThemeSnapshot } from '@pe/builder-core';

import { AbstractComponent, fromResizeObserver } from '../viewer.utils';

const DesktopBreakHeight = 900;

export interface PreviewDialogData {
  themeSnapshot: PebShopThemeSnapshot,
}

@Component({
  selector: 'peb-viewer-preview-dialog',
  templateUrl: './preview.dialog.html',
  styleUrls: ['./preview.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebViewerPreviewDialog extends AbstractComponent implements AfterViewInit {
  PebScreen = PebScreen;

  frameScreenType$ = new BehaviorSubject<PebScreen>(PebScreen.Desktop);

  themeSnapshot: PebShopThemeSnapshot;

  @ViewChild('frameWrapper')
  private frameWrapper: ElementRef;

  readonly viewInit$ = new Subject<void>();

  readonly deviceFrameTransform$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.frameWrapper.nativeElement)),
    map((ds) =>
      ds.height < DesktopBreakHeight
          ? `scale(${ds.height / DesktopBreakHeight})`
          : `scale(1)`,
    ),
    takeUntil(this.destroyed$),
  )

  constructor(
    private dialogRef: MatDialogRef<PebViewerPreviewDialog>,
    @Inject(MAT_DIALOG_DATA) data: PreviewDialogData,
  ) {
    super();

    this.themeSnapshot = data.themeSnapshot;
  }

  ngAfterViewInit() {
    this.viewInit$.next();
  }

  close() {
    this.dialogRef.close();
  }

  changeScreenType(screen: PebScreen) {
    this.frameScreenType$.next(screen);
  }
}

const HIDE_WARNINGS = [
  ElementRef,
]
