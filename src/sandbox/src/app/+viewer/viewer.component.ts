import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, pluck, startWith, switchMap } from 'rxjs/operators';

import { ContextBuilder } from '@pe/builder-editor';
import { PebScreen, PebShop, PebShopThemeSnapshot } from '@pe/builder-core';


@Injectable()
export class ViewerLocationStrategy extends HashLocationStrategy {
  prepareExternalUrl(internal: string): string {
    return (this as any)._platformLocation.location.pathname + '#' + internal;
  }
}

@Component({
  selector: 'sandbox-viewer-root',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  providers: [
    Location,
    {
      provide: LocationStrategy,
      useClass: ViewerLocationStrategy,
    },
  ],
})
export class SandboxViewerComponent {
  readonly type$ = this.route.params.pipe(
    pluck('type'),
  )

  readonly themeCompiled$ = this.route.data.pipe(
    pluck('data'),
    map((v) => v as PebShop),
  );

  readonly themeSnapshot$ = this.route.data.pipe(
    pluck('data'),
    map((v) => v as PebShopThemeSnapshot),
  );

  constructor(
    public route: ActivatedRoute,
    public contextService: ContextBuilder,
  ) {
    (window as any).viewer = this;
  }




  //
  // readonly screen$ = fromEvent(window, 'resize').pipe(
  //   startWith(null as object),
  //   map(() => getScreenFromWidth(window.innerWidth)),
  //   distinctUntilChanged(),
  // );
  //
  // readonly pageId$ = this.observableFromLocation().pipe(
  //   startWith(null as object),
  //   map(() => this.location.path()),
  // );
  //
  // readonly pageSnapshot$ = combineLatest([
  //   this.theme$,
  //   this.pageId$,
  //   this.screen$,
  // ]).pipe(
  //   map(([theme, pageId, screen]) => {
  //     const page = theme.pages.find(p => p.id === pageId);
  //
  //     return {
  //       template: page.template,
  //       stylesheet: page.stylesheets[screen] || {},
  //       context: {},
  //     }
  //   }),
  // );
  //
  // private destroyed$ = new Subject<boolean>();
  //
  //
  // ngOnInit() {
  //   const currentId = this.location.path();
  //   if (!currentId || !this.theme.pages.find(p => p.id === currentId)) {
  //     this.location.go(this.theme.pages[0].id);
  //   }
  // }
  //
  // ngOnDestroy() {
  //   this.destroyed$.next(true);
  //   this.destroyed$.complete();
  // }
  //
  // get theme(): PebShop {
  //   return (this.route.data as any).value.theme;
  // }
  //
  // setPage(event: any) {
  //   this.location.go(event.target.value);
  // }
  //
  // private observableFromLocation() {
  //   return new Observable((observer) => {
  //     const sub = this.location.onUrlChange(evt => observer.next(evt));
  //
  //     return () => {}
  //   })
  // }
}
