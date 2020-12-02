import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, pluck, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { PebShop } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';

import * as yaml from 'js-yaml';

@Injectable()
export class SandboxViewerDataResolver implements Resolve<unknown> {
  constructor(
    private api: PebEditorApi,
    private http: HttpClient,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (route.params.type === 'themes') {
      return this.api.getShopThemeById(route.params.identifier).pipe(
        pluck('source', 'snapshot'),
      );
    }

    if (route.params.type === 'fixtures') {
      return this.loadYml(`/fixtures/${route.params.identifier}/theme.yml`).pipe(
        switchMap((theme: PebShop) => {
          return combineLatest(
            theme.pages.map(
              page => this.loadYml(`/fixtures/${route.params.identifier}/page.${page}.yml`),
            ),
          ).pipe(
            map((pages) => ({ ...theme, pages })),
          );
        }),
      );
    }

    return null;
  }

  private loadYml(path) {
    return this.http.get(path, {
      responseType: 'text',
    }).pipe(
      map((content) => (yaml as any).safeLoad(content)),
    )
  }
}
