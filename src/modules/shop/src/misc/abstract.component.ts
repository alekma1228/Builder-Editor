import { OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export abstract class AbstractComponent implements OnDestroy {

  protected destroyed$ = new ReplaySubject<boolean>();

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
