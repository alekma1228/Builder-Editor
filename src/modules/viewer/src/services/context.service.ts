import { Injectable, Injector, Inject, Optional } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { CONTEXT_SERVICES } from '@pe/builder-core';

import { BUILDER_APP_STATE_SERVICE } from '../viewer.constants';

export enum ContextService {
  Company = 'company',
  Products = 'products',
  Shipments = 'shipments',
}

export enum ContextParameterType {
  Static = 'static',
  Dynamic = 'dynamic',
}

export type ContextParameter = string | {
  type: ContextParameterType;
  value: string | number | string[] | number[];
};

export interface ContextSchema {
  [key: string]: {
    service: string | ContextService,
    method: string,
    params: ContextParameter[],
  };
}

@Injectable({ providedIn: 'any' })
export class ContextBuilder {
  services = {
    [ContextService.Company]: this.injector.get(CONTEXT_SERVICES[ContextService.Company], null),
    [ContextService.Products]: this.injector.get(CONTEXT_SERVICES[ContextService.Products], null),
    // [ContextService.Shipments]: this.injector.get(CONTEXT_SERVICES[ContextService.Shipments]),
  };

  constructor(
    private injector: Injector,
    // TODO(@mivnv): Remove @Optional() after shop-client refactoring
    @Optional() @Inject(BUILDER_APP_STATE_SERVICE) private rootStateService: any,
  ) {}

  get state$(): Observable<any> {
    // TODO(@mivnv): Remove  '|| of(null)' after shop-client refactoring
    return this.rootStateService?.state$ || of(null)
  }

  get state(): any {
    return this.rootStateService?.state
  }

  validateSchema(schema: ContextSchema): boolean {
    // TODO: Do!
    return true;
  }

  buildSchema(schema: ContextSchema): Observable<any> {
    const handleBlueprintPart = (plan): Observable<any> => {
      if (!this.services[plan.service]) {
        console.error(`-- Service ${plan.service} was not found`);
      }

      if (!this.services[plan.service][plan.method]) {
        console.error(`-- Method ${plan.method} was not found in ${plan.service}`);
      }

      const params = this.resolveParams<any[]>(plan.params);
      const requiredArguments = this.services[plan.service][plan.method].length;

      if (params.length < requiredArguments) {
        console.error(`-- Not enough arguments (${params.length}) have been passed to ${plan.service}.${plan.method}`);
      }

      return this.services[plan.service][plan.method](...params);
    };

    const schemaEmpty = !Object.keys(schema || {}).length;

    return (schemaEmpty
      ? of({})
      : combineLatest(
        Object.entries(schema).map(
          ([key, part]) => handleBlueprintPart(part).pipe(
            map(result => [key, result]),
          ),
        ),
      ).pipe(
        map(results => (Object as any).fromEntries(results)),
        map(results => ({
          ...this.state,
          ...results,
        })),
      )
    );
  }

  private resolveParams<T>(params: ContextParameter[]): T {
    return params.reduce((acc: any, curr) => {
      // TODO: resolve state params
      // const param = typeof curr === 'string' || typeof curr === 'number'
      //   ? curr
      //   : (curr.type === ContextParameterType.Dynamic
      //     ? this.resolveStateParameter(curr.value as string)
      //     : curr.value);

      // const param = curr?.type ===

      return [ ...acc, curr ];
    }, []);
  }

  private resolveStateParameter<T>(
    path: string,
    state: any = this.rootStateService.value,
  ): T {
    return path.split('.').reduce((acc, curr) => acc ? acc[curr] : null, state);
  }
}
