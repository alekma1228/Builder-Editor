import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { PePlatformHeaderService } from '@pe/platform-header';

import { AbstractComponent } from '../../../misc/abstract.component';

@Component({
  selector: 'peb-shop-password-settings',
  templateUrl: './shop-password-settings.component.html',
  styleUrls: ['./shop-password-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopPasswordSettingsComponent extends AbstractComponent implements OnInit {

  form: FormGroup;
  shopDeploy = this.activatedRoute.parent.snapshot.data?.shop.accessConfig;
  loading: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: PebEditorApi,
    @Optional() private platformHeader: PePlatformHeaderService,
  ) {
    super();
  }

  ngOnInit() {
    this.platformHeader?.setShortHeader({
      title: 'Password',
    });
    this.form = this.formBuilder.group({
      privatePassword: [
        this.shopDeploy?.privatePassword,
        [...(this.shopDeploy?.isPrivate ? [ Validators.required ] : [])],
      ],
      privateMessage: [
        this.shopDeploy?.privateMessage,
        [...(this.shopDeploy?.isPrivate ? [ Validators.required ] : [])],
      ],
      isPrivate: [this.shopDeploy?.isPrivate, [ Validators.required ]],
    });

    this.form.get('isPrivate').valueChanges.pipe(
      tap(isPrivate => {
        if (isPrivate) {
          this.form.get('privatePassword').setValidators([Validators.required]);
          this.form.get('privatePassword').updateValueAndValidity();

          this.form.get('privateMessage').setValidators([Validators.required]);
          this.form.get('privateMessage').updateValueAndValidity();
        } else {
          this.form.get('privatePassword').clearValidators();
          this.form.get('privatePassword').updateValueAndValidity();

          this.form.get('privateMessage').clearValidators();
          this.form.get('privateMessage').updateValueAndValidity();
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
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
