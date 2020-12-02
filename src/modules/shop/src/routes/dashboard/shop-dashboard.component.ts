import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { pluck, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { MessageBus } from '@pe/builder-core';
import { PebEditorApi, ShopPreviewDTO } from '@pe/builder-api';

import { AbstractComponent } from '../../misc/abstract.component';

@Component({
  selector: 'peb-shop-dashboard',
  templateUrl: './shop-dashboard.component.html',
  styleUrls: ['./shop-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopDashboardComponent extends AbstractComponent implements OnInit {

  shop: any;
  shopId: string;
  editButtonLoading: boolean;

  shopId$ = this.activatedRoute.parent.params.pipe(
    pluck('shopId'),
  );

  preview$: Observable<ShopPreviewDTO> = this.shopId$.pipe(
    switchMap(shopId => this.apiService.getShopPreview(shopId)),
    shareReplay(1),
  );

  constructor(
    private messageBus: MessageBus,
    private apiService: PebEditorApi,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit() {
    this.shopId = this.activatedRoute.parent.snapshot.params.shopId;

    this.apiService.getShop(this.shopId).pipe(
      tap((shop: any) => {
        this.shop = shop;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onEditClick(): void {
    this.editButtonLoading = true;
    this.cdr.markForCheck();
    this.messageBus.emit('shop.open-builder', this.shopId);
  }

  onOpenClick(): void {
    this.messageBus.emit('shop.open', this.shop);
  }
}
