import { Validators } from '@angular/forms';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { isEqual, isUndefined } from 'lodash';
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs';
import { debounceTime, finalize, map, pairwise, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateLogger, PebElementDef, PebElementType } from '@pe/builder-core';

import { PebEditorBehaviorAddElement } from '../../general/add-element.behavior';
import { PebEditorSectionSidebar } from './section.sidebar';
import { Axis, PebEditorElement } from '../../../renderer/editor-element';
import { PebEditorSectionLabelsControl } from '../../../controls/section-labels/section-labels.control';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { adaptGridAreas, getGridStyles } from '../../transforming/resizing-utils';
import { PebEditorElementSection } from '../../../renderer/elements/editor-element-section';

const log = pebCreateLogger('editor:behaviors:edit-section');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditSection extends AbstractEditElementWithSidebar<PebEditorSectionSidebar> {
  static elementTypes = [PebElementType.Section];

  sidebarComponent = PebEditorSectionSidebar;

  logger = { log };

  constructor(
    injector: Injector,
    private behaviorAddElement: PebEditorBehaviorAddElement,
  ) {
    super(injector);
  }

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp: PebEditorElementSection) => {
        this.initSectionForm(elCmp);
        this.initBackgroundForm(elCmp);
        this.initDimensionsForm(elCmp);

        const sidebarRef = this.initSidebar(elCmp);

        return merge(
          this.handleSectionForm(elCmp, sidebarRef),
          this.handleBackgroundForm(elCmp, sidebarRef),
          this.handleDimensionsForm(elCmp),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => sidebarRef.destroy()),
        );
      }),
    );
  }

  private initSectionForm(elementCmp: PebEditorElementSection) {
    const initialValue = {
      name: elementCmp.definition.data && elementCmp.definition.data.name ? elementCmp.definition.data.name : '',
      sticky: elementCmp.styles.position === 'sticky',
      default: !this.isDeletableSection(elementCmp),
      isFirstSection: this.canElementBeSticky(elementCmp),
      newElement: false,
    };

    elementCmp.section = {
      initialValue,
      form: this.formBuilder.group({
        name: [initialValue.name],
        sticky: [initialValue.sticky],
        default: [initialValue.default],
        newElement: [initialValue.newElement],
        moveElement: [initialValue.newElement],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  private handleSectionForm(elementCmp: PebEditorElementSection, sidebarRef: ComponentRef<any>): Observable<any> {
    const section = elementCmp.section;

    return merge(
      section.form.get('sticky').valueChanges.pipe(
        tap((sticky: boolean) => {

          const newStyles = {
            position: sticky ? 'sticky' : 'relative',
            top: sticky ? 0 : null,
            zIndex: sticky ? 1 : null,
          };

          elementCmp.styles = { ...elementCmp.styles, ...newStyles };
          elementCmp.applyStyles();

          section.initialValue.isFirstSection = this.canElementBeSticky(elementCmp);
          sidebarRef.changeDetectorRef.detectChanges();

          return this.store.updateStyles(this.state.screen, {
            [elementCmp.definition.id]: newStyles,
          });
        }),
      ),
      section.form.get('default').valueChanges.pipe(
        switchMap((value: boolean) => {
          const newElementDef: PebElementDef = {
            ...elementCmp.definition,
            meta: {
              deletable: !(elementCmp.siblings.length === 0 ?? value),
            },
          };
          return this.store.updateElement(newElementDef);
        }),
      ),
      section.form.get('name').valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          const newElementDef: PebElementDef = {
            ...elementCmp.definition,
            data: {
              ...elementCmp.definition.data,
              name,
            },
          };

          const sidebarCtrlLabel: PebEditorSectionLabelsControl = elementCmp.controls?.labels?.instance;
          if (sidebarCtrlLabel) sidebarCtrlLabel.labelText = name;

          return this.store.updateElement(newElementDef);
        }),
      ),

      section.form.get('newElement').valueChanges.pipe(
        switchMap((value: boolean) => {
          const newStyles = {
            ...elementCmp.styles,
            position: 'relative',
            zIndex: null,
          };
          this.updateStyles(elementCmp, newStyles);
          this.store.updateStyles(this.state.screen, {
            [elementCmp.definition.id]: newStyles,
          });

          return this.behaviorAddElement.addSection({
            variant: PebElementType.Section,
            type: PebElementType.Section,
            setAfter: value,
          });
        }),
      ),

      section.form.get('moveElement').valueChanges.pipe(
        map((moveDirection: boolean) => {
          this.editor.manipulateElementSubject$.next({
            selectedElements: this.state.selectedElements,
            type: 'copy',
            screen: this.state.screen,
          })
          return moveDirection ? 'moveUp' : 'moveDown';
        }),
        map((moveDirection: string) => {
          moveDirection === 'moveUp' ?
            this.editor.manipulateSectionSubject$.next({
              type: 'moveUp',
              screen: this.state.screen,
            }) : this.editor.manipulateSectionSubject$.next({
              type: 'moveDown',
              screen: this.state.screen,
            })
        }),
      ),

    );
  }

  //
  //  Dimensions
  //
  protected initDimensionsForm(elementCmp: PebEditorElement) {
    const elementDs = elementCmp.getAbsoluteElementRect();
    const initialValue = { height: elementDs.height };

    const dimensionsLimits = this.getDimensionsLimits(elementCmp);

    elementCmp.dimensions = {
      initialValue,
      form: this.formBuilder.group({
        height: [
          initialValue.height,
          [Validators.min(dimensionsLimits.height.min), Validators.max(dimensionsLimits.height.max)],
        ],
      }),
      limits: {
        height: new BehaviorSubject(dimensionsLimits.height),
      },
      update: this.updateDimensionsForm(elementCmp),
      submit: new Subject<any>(),
    } as any;
  }

  protected updateDimensionsForm = (elementCmp) => () => {
    const dimensionsLimits = this.getDimensionsLimits(elementCmp);

    elementCmp.dimensions.form.controls.height.setValidators([
      Validators.min(dimensionsLimits.height.min), Validators.max(dimensionsLimits.height.max),
    ]);

    elementCmp.dimensions.limits.height.next(dimensionsLimits.height);
  };

  protected getDimensionsLimits(elementCmp) {
    return {
      height: {
        min: elementCmp.getMinPossibleDimensions(Axis.Vertical),
        max: Infinity,
      },
    } as any;
  }

  protected handleDimensionsForm(elCmp: PebEditorElement): Observable<any> {
    const elDef = elCmp.definition;
    const dimensions = elCmp.dimensions;
    const initialGridStyles = getGridStyles(elCmp.contentContainer, this.state.scale);

    return merge(
      dimensions.form.valueChanges.pipe(
        startWith(null as object),
        pairwise(),
        tap(([prevValue, value]: any[]) => {
          if (dimensions.form.invalid) {
            this.logger.log('Dimensions: Change: Invalid');
            return;
          }

          this.logger.log('Dimensions: Change: Valid ', dimensions.form.value);
          elCmp.styles.height = value.height;
          if (elCmp.styles.gridTemplateRows) {
            elCmp.styles.gridTemplateRows = adaptGridAreas(
              value.height,
              initialGridStyles.gridTemplateRows as string,
            );
          }

          elCmp.applyStyles();
        }),
      ),
      dimensions.submit.pipe(
        switchMap(() => {
          if (dimensions.form.invalid || isEqual(dimensions.initialValue, dimensions.form.value)) {
            return EMPTY;
          }

          this.logger.log('Dimensions: Submit ', dimensions.form.value);
          elCmp.dimensions.update();

          const height = dimensions.form.value.height;
          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: {
              height: dimensions.form.value.height,
              ...(elCmp.styles.gridTemplateRows
                && {
                  gridTemplateRows: adaptGridAreas(
                    height,
                    initialGridStyles.gridTemplateRows as string,
                  ),
                }
              ),
            },
          });
        }),
      ),
    );
  }

  private canElementBeSticky(element: PebEditorElement) {
    return element.parent.children
      .filter(el => el.target.element.type === 'section')
      .findIndex(el => el.target.element.id === element.target.element.id) === 0;
  }

  private isDeletableSection(element: PebEditorElement): boolean {
    if (element.definition.meta && !isUndefined(element.definition.meta.deletable)) {
      return element.definition.meta.deletable && !(element.siblings.length === 0);
    }
    return false;
  }
}
