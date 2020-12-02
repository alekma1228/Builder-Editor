import { ComponentRef, Injectable, Type } from '@angular/core';
import { merge, Observable } from 'rxjs';
import {
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import {
  pebCreateLogger,
  PebElementDef,
  PebElementId,
  PebElementType,
  pebFindElementsDeep,
  PebStylesheet,
  PebTemplate,
} from '@pe/builder-core';

import { PebEditorToolbarComponent } from '../../../toolbar/toolbar.component';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { PebEditorPageValidatorSidebar } from './page-validator.sidebar';

const log = pebCreateLogger('editor:behaviors:theme-validator');

@Injectable()
export class PebEditorPageValidatorBehavior extends AbstractEditElementWithSidebar<PebEditorPageValidatorSidebar> {

  sidebarComponent = PebEditorPageValidatorSidebar;

  sidebar: ComponentRef<PebEditorPageValidatorSidebar> = null;

  toolbar: PebEditorToolbarComponent = this.editor.toolbar;

  logger = { log };

  init(): Observable<any> {
    return merge(
      this.toolbar.toggleThemeValidatorSidebar.pipe(
        filter(() => {
          if (this.sidebar) {
            this.sidebar.destroy();
            this.sidebar = null;
            return false;
          }

          this.sidebar = this.editor.openSidebar(this.sidebarComponent);
          return true;
        }),
        switchMap(() => merge(
          this.validate(),
          this.sidebar.instance.elementSelect.pipe(
            tap((id: string) => {
              const component = this.renderer.getElementComponent(id);

              if (!component) {
                return;
              }

              this.state.selectedElements = [id];

              component.controls.edges.instance.valid = false;
              component.controls.edges.instance.detectChanges();
            }),
          ),
        )),
      ),
      this.state.selectedElements$.pipe(
        filter(() => !!this.sidebar),
        tap(() => {
          this.sidebar.destroy();
          this.sidebar = null;
        }),
      ),
    )

  }

  get elementRequiredStyles() {
    return {
      [PebElementType.Text]: [
        'width',
      ],
      [PebElementType.Image]: [
        'width',
        'height',
      ],
    }
  }

  get elementPossibleChildrenTypes() {
    return {
      [PebElementType.Document]: [PebElementType.Section],
      [PebElementType.Section]: Object.values(PebElementType).filter(
        t => t !== PebElementType.Document && t !== PebElementType.Section,
      ),
      [PebElementType.Block]: Object.values(PebElementType).filter(
        t => t !== PebElementType.Document && t !== PebElementType.Section,
      ),
      [PebElementType.Text]: [],
      [PebElementType.Image]: [],
      [PebElementType.Button]: [],
      [PebElementType.Cart]: [],
      [PebElementType.Shape]: Object.values(PebElementType).filter(
        t => t !== PebElementType.Document
          && t !== PebElementType.Section
          && t !== PebElementType.ProductDetails
          && t !== PebElementType.Products
          && t !== PebElementType.ProductCatalog,
      ),
      [PebElementType.Carousel]: [],
      [PebElementType.Logo]: [],
      [PebElementType.Line]: [],
      [PebElementType.Video]: [],
      [PebElementType.Menu]: [],
      [PebElementType.ProductDetails]: [],
      [PebElementType.Products]: [],
      [PebElementType.ProductCatalog]: [],
    }
  }

  private validate() {
    return this.store.snapshot$.pipe(
      map((snapshot) => {
        const page = snapshot.pages[this.store.activePageId];
        return {
          template: snapshot.templates[page.templateId],
          stylesheet: snapshot.stylesheets[page.stylesheetIds[this.state.screen]],
        }
      }),
      map(({ template, stylesheet }) => {
        const exceptions = [
          ...Object.keys(this.elementPossibleChildrenTypes).map((elementType: PebElementType) => ({
            title: `Wrong children type inside ${elementType} element`,
            description: this.elementPossibleChildrenTypes[elementType]?.length
              ? `Element with type "${elementType}" can contain only elements with types: ${this.elementPossibleChildrenTypes[elementType].join(', ')}`
              : `Element with type "${elementType}" can't contain any elements inside`,
            elements: this.getElementsWithWrongChildrenTypes(
              template,
              stylesheet,
              elementType,
              this.elementPossibleChildrenTypes[elementType],
            ),
          })),
          ...Object.keys(this.elementRequiredStyles).map((elementType: PebElementType) => ({
            title: `Omitted required ${elementType} styles`,
            description: `Each element with type "${elementType}" must have styles: ${this.elementRequiredStyles[elementType].join(', ')}`,
            elements: this.getElementsWithOmittedStyles(
              template,
              stylesheet,
              elementType,
              this.elementRequiredStyles[elementType],
            ),
          })),
          {
            title: 'Wrong element position',
            description: 'Each element must be entirely inside its parent',
            elements: this.getElementWithWrongPosition(template, stylesheet),
          },
        ];

        const completelyBrokenElements =
          this.getCompletelyBrokenElements(
            exceptions.reduce((acc, e) => ([...acc, ...e.elements]), []),
          );

        return { exceptions, completelyBrokenElements }
      }),
      tap(({ exceptions, completelyBrokenElements }) => {
        this.sidebar.instance.completelyBrokenElements = completelyBrokenElements;
        this.sidebar.instance.exceptions = exceptions.filter(e => e.elements.length);
      }),
    )
  }

  private getCompletelyBrokenElements(elements: PebElementDef[]): PebElementId[] {
    return elements.filter(el => {
      return !this.renderer.getElementComponent(el.id)?.definition;
    }).map(el => el.id)
  }

  private getElementsWithWrongChildrenTypes(
    template: PebTemplate,
    stylesheet: PebStylesheet,
    elementType: PebElementType,
    requiredTypes: PebElementType[],
  ): PebElementDef[] {
    if (elementType === PebElementType.Document) {
      return template.children.filter(c => !requiredTypes.find(t => t === c.type));
    }

    return pebFindElementsDeep(template, el =>
      el.type === elementType
      && !!el.children.find(c => !requiredTypes.find(t => t === c.type)),
    )
  }

  private getElementsWithOmittedStyles(
    template: PebTemplate,
    stylesheet: PebStylesheet,
    elementType: PebElementType,
    requiredStyles: string[],
  ): PebElementDef[] {
    return pebFindElementsDeep(template, el =>
      el.type === elementType
      && !!requiredStyles.find(s => !stylesheet[el.id]
      || (stylesheet[el.id]?.display !== 'none' && stylesheet[el.id][s] === undefined)),
    )
  }

  private getElementWithWrongPosition(template: PebTemplate, stylesheet: PebStylesheet): PebElementDef[] {
    return pebFindElementsDeep(template, el => {
      if (stylesheet[el.id]?.display === 'none') {
        return false;
      }

      const elementCmp = this.renderer.getElementComponent(el.id);

      if (!elementCmp) {
        return false;
      }

      const siblings = elementCmp.parent.definition.children?.map(elDef => this.renderer.getElementComponent(elDef.id))

      const intersectWithNextSiblings = siblings.some(
        (sibling) => this.renderer.elementIntersect(elementCmp, sibling),
      );

      const fullIncludedToNextParent = this.renderer.elementInclude(elementCmp, elementCmp.parent);

      const elementInsideContentContainer = this.renderer.elementInsideContentContainer(elementCmp, elementCmp.parent);

      return fullIncludedToNextParent && !intersectWithNextSiblings && elementInsideContentContainer;
    });
  }

}
