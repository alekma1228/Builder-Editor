import {
  ApplicationRef,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { delay, first, map } from 'rxjs/operators';
import { merge } from 'lodash';

import { FontLoaderService } from '@pe/builder-font-loader';
import { ContextBuilder } from '@pe/builder-editor';
import { PebElementDef, PebPage, PebScreen, PebShop } from '@pe/builder-core';
import { AVAILABLE_ELEMENTS_MAP, PebRenderer } from '@pe/builder-renderer';

import { ELEMENT_COMPONENTS } from '../../../../modules/renderer/src/renderer.tokens';
import { PebEditorRenderer } from '../../../../modules/editor/src/renderer/editor-renderer';
import { calculateGrid } from '../../../../modules/editor/src/behaviors/transforming/calculate-grid';

@Injectable({ providedIn: 'root' })
export class PrepareShopService {

  constructor(
    private applicationRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private fontLoaderService: FontLoaderService,
    private contextManager: ContextBuilder,
  ) {}

  replaceAllStylesWithGrid(theme: PebShop): Observable<PebShop> {
    const container = this.applicationRef.components[0].instance.viewContainerRef;

    this.fontLoaderService.renderFontLoader();

    return forkJoin(theme.pages.map((page) => {
      return forkJoin(Object.values(PebScreen).map((screen) => {
        return this.createRendererForPage(
          container,
          page,
          screen,
        ).pipe(
          map(rendererRef => ({ [screen]: this.calculateStylesForPage(rendererRef, page) })),
        );
      })).pipe(
        map((stylesheetsArrays) => {
          const stylesheets = stylesheetsArrays.reduce((acc, stylesheet) => ({ ...acc, ...stylesheet }), {});
          Object.keys(stylesheets).map((screen) => {
            page.stylesheets = {
              ...page.stylesheets,
              [screen]: {
                ...page.stylesheets[screen],
                ...stylesheets[screen],
              },
            };
          });
          return page;
        }),
      );
    })).pipe(
      map(pages => ({ ...theme, pages })),
    );
  }

  private calculateStylesForPage(
    rendererRef: ComponentRef<PebRenderer>,
    page: PebPage,
  ) {
    const editorRenderer = new PebEditorRenderer(rendererRef.instance);

    const elementsWithChildren = this.flat(
      rendererRef.instance.registry.get(page.template.id).element,
    ).filter(el => !!el?.children?.length);

    const updatedStyles = elementsWithChildren.reduce(
      (acc, el) => {
        const gridStyles = calculateGrid(
          editorRenderer.createEditorElement(rendererRef.instance.registry.get(el.id)),
          el.children.filter(child => !!child).map(child =>
            editorRenderer.createEditorElement(rendererRef.instance.registry.get(child.id))));

        return merge(acc, gridStyles);
      },
      {},
    );

    rendererRef.destroy();

    return updatedStyles;
  }

  private createRendererForPage(
    container: ViewContainerRef,
    page: PebPage,
    screen: PebScreen,
  ): Observable<ComponentRef<PebRenderer>> {
    const factory: ComponentFactory<PebRenderer> = this.resolver.resolveComponentFactory(PebRenderer);
    const cmpInjector = Injector.create({
      parent: container.injector,
      providers: [
        { provide: ELEMENT_COMPONENTS, useValue: AVAILABLE_ELEMENTS_MAP },
        {
          provide: 'RENDERER_SETTINGS',
          useValue: {
            dimensions: {
              desktop: 1280,
              tablet: 768,
              mobile: 360,
            },
          },
        },
      ],
    });

    const cmpRef: ComponentRef<PebRenderer> = factory.create(cmpInjector);

    cmpRef.location.nativeElement.setAttribute(
      'style',
      `display: block; width: ${screen === PebScreen.Desktop ? 1280 : screen === PebScreen.Tablet ? 768 : 360}px; overflow: hidden;`,
    );

    cmpRef.instance.options.screen = screen;
    cmpRef.instance.element = page.template;
    cmpRef.instance.stylesheet = page.stylesheets[screen];
    cmpRef.instance.context = {
      ...this.contextManager.rootState,
      ...this.contextManager.buildSchema(page.context),
    };

    container.insert(cmpRef.hostView);

    return cmpRef.instance.rendered.pipe(
      first(),
      delay(1000), // TODO: check it. Sometimes have wrong grid calculations probably because not fully rendered yet
      map(_ => cmpRef),
    );
  }

  private flat(element: PebElementDef): PebElementDef[] {
    return element.children?.reduce(
      (acc, el) => ([
        ...acc,
        el,
        ...(el?.children ? this.flat(el) : []),
      ]),
      [],
    );
  }

}
