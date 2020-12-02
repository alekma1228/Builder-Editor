import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { PePlatformHeaderService } from '@pe/platform-header';

import { AbstractComponent } from '../../../misc/abstract.component';
import { PEB_SHOP_HOST } from '../../../constants';

@Component({
  selector: 'peb-shop-local-domain-settings',
  templateUrl: './shop-local-domain-settings.component.html',
  styleUrls: ['./shop-local-domain-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopLocalDomainSettingsComponent extends AbstractComponent implements OnInit {

  form: FormGroup;
  shopDeploy = this.activatedRoute.parent.snapshot.data?.shop.accessConfig;
  loading: boolean;
  shopHost: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: PebEditorApi,
    @Optional() private platformHeader: PePlatformHeaderService,
    @Optional() @Inject(PEB_SHOP_HOST) private pebShopHost: string,
  ) {
    super();
    this.shopHost = this.pebShopHost;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      internalDomain: [this.shopDeploy?.internalDomain, [ Validators.required, domainValidator ]],
    })
    this.platformHeader?.setShortHeader({
      title: 'Local domain',
    });
  }

  onSubmit() {
    this.form.disable();
    this.loading = true;

    const body = {
      internalDomain: this.shopDeploy?.internalDomain,
      isLive: this.shopDeploy?.isLive,
      isLocked: this.shopDeploy?.isLocked,
      isPrivate: this.shopDeploy?.isPrivate,
      ownDomain: this.shopDeploy?.ownDomain,
      privateMessage: this.shopDeploy?.privateMessage,
      ...this.form.value,
    };

    this.apiService.updateShopDeploy(
      this.activatedRoute.parent.snapshot.data.shop.id,
      body,
    ).pipe(
      tap(accessConfig => {
        this.activatedRoute.parent.snapshot.data = {
          ...this.activatedRoute.parent.snapshot.data,
          shop: {
            ...this.activatedRoute.parent.snapshot.data.shop,
            accessConfig,
          }
        }
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then(() => {
          this.platformHeader?.setFullHeader();
        });
      }),
      catchError(e => {
        this.form.enable();
        alert(e.error.message);
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}

function domainValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (!/^[A-Za-z0-9\d_-]*$/.test(control.value)) {
    return { domain: true };
  }

  return null;
}
