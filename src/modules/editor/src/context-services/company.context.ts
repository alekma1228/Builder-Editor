import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { PebElementContextState, PebEnvService } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';


@Injectable({ providedIn: 'root' })
export class CompanyContext {
  constructor(
    private apiService: PebEditorApi,
    private envService: PebEnvService,
  ){}

  getLogo() {
    return this.apiService.getShop(this.envService.shopId).pipe(
      map((shop: any) => {
        const result = shop?.picture
          ? {
            state: PebElementContextState.Ready,
            data: {
              src: shop.picture,
            },
          }
          : { state: PebElementContextState.Empty };

        return result;
      }),
    );
  }
}
