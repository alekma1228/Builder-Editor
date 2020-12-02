import { ChangeDetectorRef, Component, ElementRef, HostBinding, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';
import { Portal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';

import { MessageBus } from '@pe/builder-core';

import { SandboxSettingsService } from '../shared/settings/settings.service';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { SandboxViewerSelectionDialog } from './dialogs/viewer-selection.dialog';
import { globalPalette } from '../../styles/palette';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class SandboxRootComponent extends AbstractComponent implements OnInit {
  customToolsPortal: Portal<any> = null;

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    public viewContainerRef: ViewContainerRef,
    private settingsService: SandboxSettingsService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    private elementRef: ElementRef,
  ) {
    super();
  }

  ngOnInit() {
    this.setGlobalPalette();

    // TODO: move to service
    this.messageBus.listen('shop.created').pipe(
      tap(shopId => this.router.navigate(['themes', shopId])),
      takeUntil(this.destroyed$),
    ).subscribe()

    this.messageBus.listen('shop.open').pipe(
      tap(shopId => this.router.navigate(['editor', shopId])),
      takeUntil(this.destroyed$),
    ).subscribe()

    this.messageBus.listen('shop.edit').pipe(
      tap(shopId => this.router.navigate(['editor', shopId])),
      takeUntil(this.destroyed$),
    ).subscribe()
  }

  @HostBinding('class.front-page')
  get classFrontPage() {
    return this.router.url === '/';
  }

  openSettings() {
    this.settingsService.open();
  }

  openViewerDialog() {
    this.dialog.open(SandboxViewerSelectionDialog, {
      backdropClass: 'sandbox-dialog-backdrop',
      panelClass: 'sandbox-dialog-panel',
    });
  }

  setGlobalPalette() {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;

    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--'+key, value);
    })
  }
}
