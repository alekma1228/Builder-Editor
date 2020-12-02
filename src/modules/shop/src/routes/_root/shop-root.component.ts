import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-shop',
  templateUrl: './shop-root.component.html',
  styleUrls: ['./shop-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopComponent {}
