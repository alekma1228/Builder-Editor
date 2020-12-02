import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { MessageBus } from '@pe/builder-core';

export class SandboxMessageBus implements MessageBus {

  private readonly events$ = new Subject<{ type: string, payload: any }>();

  emit<T>(type: string, payload: T) {
    this.events$.next({ type, payload });
  }

  listen<T>(type: string): Observable<T> {
    return this.events$.asObservable().pipe(
      filter(e => e.type === type),
      map(e => e.payload),
    );
  }

}
