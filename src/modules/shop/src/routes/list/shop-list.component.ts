import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { first, share, takeUntil, tap } from 'rxjs/operators';

import { MessageBus, PebEnvService } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { PePlatformHeaderService } from '@pe/platform-header';

import { AbstractComponent } from '../../misc/abstract.component';

@Component({
  selector: 'peb-shop-list',
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopListComponent extends AbstractComponent implements OnInit {

  skeletonThemes = Array.from({ length: 3 });
  shops: any;

  defaultShopSubject = new BehaviorSubject<any>(null);

  constructor(
    private api: PebEditorApi,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    @Optional() private platformHeader: PePlatformHeaderService,
    private envService: PebEnvService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.platformHeader?.setShortHeader({
      title: 'Shop list',
    })
    this.initShops();
  }

  private initShops() {
    this.api.getShops().pipe(
      tap(shops => {
        this.shops = shops;
        this.defaultShopSubject.next(shops.find((shop) => shop.isDefault));
        this.envService.shopId = shops.find((shop) => shop.isDefault)?.id;
        if (this.envService.shopId) {
          this.envService.shopId = shops[0].id;
        }
        this.cdr.markForCheck();
      }),
      share(),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onOpen(shop: any) {
    this.messageBus.emit('shop.open', shop);
    this.platformHeader?.setFullHeader();
  }

  onEdit(shopId: string) {
    this.messageBus.emit('shop.edit', shopId);
  };

  onSetAsDefault(shop: any) {
    this.api.setAsDefaultShop(shop.id).pipe(
      first(),
      tap(() => {
        this.initShops();
        this.messageBus.emit('shop.changed-default', null);
      }),
    ).subscribe();
  }
}
