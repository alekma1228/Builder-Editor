import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {  forkJoin, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService, PebShopThemeSnapshot, PebTheme } from '@pe/builder-core';

@Injectable({ providedIn: 'root' })
export class SandboxShopResolver implements Resolve<{theme: PebTheme, snapshot: PebShopThemeSnapshot}> {
  // TODO: If theme has been just created it can be passed in route data to
  //       prevent reloading
  constructor(
    private api: PebEditorApi,
    private envService: PebEnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<{theme: PebTheme, snapshot: PebShopThemeSnapshot}> {
    this.envService.shopId = route.params.shopId;
    return forkJoin([
      this.api.getShopThemeById(route.params.shopId),
      this.api.getSnapshot(route.params.shopId),
    ]).pipe(
      map(([theme, snapshot]) => ({ theme, snapshot })),
    );
  }
}
