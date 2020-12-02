import { Injectable } from '@angular/core';
import { forkJoin, merge, Observable, of } from 'rxjs';
import { debounceTime, delay, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateLogger, PebElementDef, PebElementType, PebScreen, PebElementStyles, ScreenWidthList } from '@pe/builder-core';

import { PebEditorImageSidebar } from './image.sidebar';
import { PebEditorElement } from '../../../renderer/editor-element';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';

const log = pebCreateLogger('editor:behaviors:edit-image');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditImage extends AbstractEditElementWithSidebar<PebEditorImageSidebar> {
  static elementTypes = [PebElementType.Image];

  sidebarComponent = PebEditorImageSidebar;

  logger = { log };

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp: PebEditorElement) => {
        this.initPositionForm(elCmp);
        this.initDimensionsForm(elCmp);
        this.initProportionsForm(elCmp);

        const sidebarRef = this.initSidebar(elCmp, {
          imgSrc: elCmp?.styles?.background?.[this.state.screen] || elCmp?.styles?.background
            || elCmp.context?.styles?.backgrounds?.[this.state.screen] || elCmp.context?.styles?.background,
        });
        // debugger

        return merge(
          this.handlePositionForm(elCmp),
          this.handleDimensionsForm(elCmp),
          this.handleProportionsForm(elCmp),
          this.state.screen$.pipe(
            // TODO: find out how to remove delay not braking sidebar reloading
            delay(10),
            tap(() => {
              this.initPositionForm(elCmp);
              this.initDimensionsForm(elCmp);
              this.initProportionsForm(elCmp);
            }),
          ),
          this.editFlow(elCmp, sidebarRef.instance),
          this.handleScreenChange(elCmp, sidebarRef.instance),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => sidebarRef.destroy()),
        );
      }),
    );
  }

  private handleScreenChange(
    el: PebEditorElement,
    sidebar: PebEditorImageSidebar,
  ): Observable<any> {
    // sync styles on change screen
    return this.state.screen$.pipe(
      filter(() => !el.definition.data?.sync), // when sync === true styles of all screens are the same
      tap((screen: PebScreen) => {
        // update form with styles of new screen
        const snapshot = this.store.snapshot;
        const stylesheetIds = snapshot.pages[this.store.activePageId].stylesheetIds;
        if (stylesheetIds) {
          const stylesheetId = stylesheetIds[screen];
          if (stylesheetId) {
            const styles = snapshot.stylesheets[stylesheetId][el.definition.id];
            sidebar.patchForm(styles);
          }
        }
      }),
    );
  }

  private updateImageOnOtherScreens(element, styles: PebElementStyles) {
    const screenStyles = Object.values(PebScreen).reduce((acc, screen: PebScreen) => {
      const stylesheet = {
        ...element.target.styles,
        ...styles,
      };
      if (screen !== this.state.screen) {
        // don't change position for other screens
        stylesheet.width = this.calcElementLeftWidthByScreen(element, screen);
        const newStyles = Object.keys(stylesheet)
          .filter(prop => !(/^margin|gridArea$|gridColumn$/.test(prop)))
          .reduce((result, prop) => (result[prop] = stylesheet[prop], result), {});
        acc[screen] = { [element.definition.id]: newStyles };
      } else {
        acc[screen] = { [element.definition.id]: stylesheet };
      }
      return acc;
    }, {});
    return this.store.updateStylesByScreen(screenStyles);
  }

  calcElementLeftWidthByScreen(element, screen: PebScreen) {
    const page = this.store.snapshot.pages[this.store.activePageId];
    const stylesheetId = page.stylesheetIds[screen];
    const styleSheets = this.store.snapshot.stylesheets[stylesheetId];
    const oldStyles = styleSheets[element.target.element.id];
    const oldMarginLeft = oldStyles.marginLeft as number;
    const calcPossibleWidth = ScreenWidthList[screen] - (oldMarginLeft + element.target.styles.width);
    return calcPossibleWidth < 0 ? ScreenWidthList[screen] - oldMarginLeft : element.target.styles.width;
  }

  //
  //  Old code
  //
  editFlow(element: PebEditorElement, sidebar: PebEditorImageSidebar): Observable<any> {
    return merge(
      sidebar.changeStyle.pipe(
        tap((styles) => {
          element.styles = { ...element.styles, ...styles };
          element.applyStyles();
        }),
      ),
      sidebar.changeStyleFinal.pipe(
        tap((styles) => {
          element.styles = { ...element.styles, ...styles };
        }),
        debounceTime(500),
        switchMap((styles) => {
          const sync = element.definition.data?.sync;
          if (sync) {
            return this.updateImageOnOtherScreens(element, styles);
          }
          return this.store.updateStyles(this.state.screen, {
            [element.definition.id]: styles,
          });
        }),
      ),
      sidebar.changeData.pipe(
        switchMap((data) => {
          if (element.definition.type === PebElementType.Logo) {
            return of(data.src);
          }
          const elementData = {
            ...element.definition.data,
            sync: data.sync ?? element.definition.data.sync,
          };

          const newElementDef: PebElementDef = {
            ...element.definition,
            data: elementData,
          };
          element.definition.data = newElementDef.data;

          const screens = elementData.sync ? Object.values(PebScreen) : [element.target.options.screen];
          const updateStylesObservables = [];
          if (data.srcScreens) {
            screens.forEach((screen: PebScreen) => {
              const page = this.store.snapshot.pages[this.store.activePageId];
              const stylesheetId = page.stylesheetIds[screen];
              const stylesheet = this.store.snapshot.stylesheets[stylesheetId];
              stylesheet[element.definition.id].background = data.srcScreens[this.state.screen];
              updateStylesObservables.push(
                this.store.updateStyles(screen, stylesheet, element.target.options.screen).pipe(
                  tap(() => element.detectChanges()),
                ),
              );
            });
          }

          // widget.cdr.detectChanges();
          // TODO: create more efficient way to detect changes in image element
          return forkJoin([
            this.store.updateElement(newElementDef).pipe(
              tap(() => element.detectChanges()),
            ),
            updateStylesObservables,
          ]);
        }),
      ),
    );
  }
}
