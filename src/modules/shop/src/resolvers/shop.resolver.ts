
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

@Injectable()
export class ShopResolver implements Resolve<any> {
  constructor(
    private apiService: PebEditorApi,
    private router: Router,
    private envService: PebEnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {

    // TODO: redirect doesn't work
    // if (!this.envService.shopId) {
    //   return this.router.createUrlTree(['./list']);
    // }

    return this.apiService.getShop(this.envService.shopId).pipe(
      tap(shop => {
        route.data = { ...route.data, shop };
      }),
    );
  }

}
