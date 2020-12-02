import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isEmpty } from 'lodash';

import {
  ContextService,
  CONTEXT_SERVICES,
  PebElementContext,
  PebElementContextState,
} from '@pe/builder-core';

import { mockProductDetails } from '../context-services/mock-product';
import { mockShopCategory } from '../context-services/mock-category';
import { mockCartProducts } from '../context-services/mock-cart-products';
import { mockPosCatalog } from '../context-services/mock-catalog';

export enum ContextParameterType {
  Static = 'static',
  Dynamic = 'dynamic',
}

export type ContextParameter =
  | string
  | number
  | (string | number)[]
  | {
      type: ContextParameterType;
      value: string | number;
    };

// TODO(@dmlukichev): Check why this typing has been disabled
export interface ContextSchema {
  [key: string]: ContextPlan;
}

export interface ContextPlan {
  service: ContextService;
  method: string;
  params: ContextParameter[];
}

export interface RootState {
  '@search'?: string;
  '@cart'?: PebElementContext<
    {
      count: number;
      product: any; // TODO: add typings
    }[]
  >;
  '@category'?: PebElementContext<{
    sortBy: string;
    shownFilters: boolean;
    activatedFilters: any[];
    disabledFilters: any[];
  }>;
  '@product-details'?: {};
  '@mobile-menu'?: PebElementContext<{
    routes: any[];
  }>;
  '@pos-catalog': PebElementContext<any>,
}

const INITIAL_STATE: RootState = {
  '@cart': {
    data: mockCartProducts,
    state: PebElementContextState.Ready,
  },
  '@search': '',
  '@category': mockShopCategory,
  '@product-details': mockProductDetails,
  '@mobile-menu': {
    state: PebElementContextState.Empty,
    data: {
      routes: [],
    },
  },
  '@pos-catalog': mockPosCatalog,
};

// TODO: should be reusable for editor and client
@Injectable({ providedIn: 'any' })
export class ContextBuilder {
  private readonly rootStateSubject$ = new BehaviorSubject<RootState>(
    INITIAL_STATE,
  );

  private readonly cacheData = new Map();

  services = {
    [ContextService.Products]: this.injector.get(
      CONTEXT_SERVICES[ContextService.Products],
    ),
    [ContextService.Company]: this.injector.get(
      CONTEXT_SERVICES[ContextService.Company],
    ),
  };

  constructor(
    private injector: Injector,
  ) {}

  // TODO: Move to own service
  get rootState$(): Observable<RootState> {
    return this.rootStateSubject$.asObservable();
  }

  get rootState(): RootState {
    return this.rootStateSubject$.value;
  }

  patchRootState(value: RootState): void {
    this.rootStateSubject$.next({
      ...this.rootState,
      ...value,
    });
  }

  validateSchema(schema: ContextSchema): boolean {
    // TODO: Do!
    return true;
  }

  buildSchema(schema: ContextSchema): any {
    const schemaEmpty = !Object.keys(schema).length;

    return (schemaEmpty
      ? of({})
      : forkJoin(
          Object.entries(schema).reduce(
            (acc, [key, value]) => {
              return {
                ...acc,
                [key]: this.handleBlueprintPart(value),
              };
            },
            {},
          ),
        )
    ).pipe(
      map(results => ({
        ...INITIAL_STATE,
        ...results,
      })),
    );
  }

  private handleBlueprintPart(plan: ContextPlan): Observable<any> {
    if (isEmpty(plan)) {
      return of({
        state: PebElementContextState.Empty,
      })
    }

    if (!this.services[plan.service]) {
      console.error(`-- Service ${plan.service} was not found`);
    }

    if (!this.services[plan.service][plan.method]) {
      console.error(
        `-- Method ${plan.method} was not found in ${plan.service}`,
      );
    }

    const params = this.resolveParams<any[]>(plan.params);
    const requiredArguments = this.services[plan.service][plan.method].length;

    if (params.length < requiredArguments) {
      console.error(
        `-- Not enough arguments (${params.length}) have been passed to ${plan.service}.${plan.method}`,
      );
    }

    const cached = this.getCache(plan);
    if (cached) {
      return of(cached);
    }

    return this.services[plan.service][plan.method](...params).pipe(
      tap(value => this.setCache(plan, value)),
    );
  }

  private resolveParams<T>(params: ContextParameter[]): T {
    return params.reduce((acc: any, curr: any) => {
      const isSimpleParameter =
        ['string', 'number'].includes(typeof curr) || Array.isArray(curr);
      const param = isSimpleParameter
        ? curr
        : curr.type === ContextParameterType.Dynamic
        ? this.resolveStateParameter(curr.value as string)
        : curr.value;

      return [...acc, param];
    }, []);
  }

  private resolveStateParameter<T>(
    path: string,
    state: RootState = this.rootState,
  ): T {
    return path
      .split('.')
      .reduce((acc, curr) => (acc ? acc[curr] : null), state);
  }

  private setCache(plan: ContextPlan, value: any) {
    this.cacheData.set(`${plan.service}-${plan.method}-${JSON.stringify(plan.params)}`, value);
  }

  private getCache(plan: ContextPlan): any {
    return this.cacheData.get(`${plan.service}-${plan.method}-${JSON.stringify(plan.params)}`);
  }

  clearCache() {
    this.cacheData.clear();
  }
}
