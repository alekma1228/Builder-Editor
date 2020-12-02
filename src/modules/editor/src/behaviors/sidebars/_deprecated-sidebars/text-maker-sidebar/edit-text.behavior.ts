import { ComponentRef, Inject, Injectable, Injector } from '@angular/core';
import { EMPTY, merge, Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import { isEqual, merge as lodashMerge } from 'lodash';

import {
  pebCreateLogger,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebScreen,
  PEB_DEFAULT_FONT_COLOR,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
  ScreenWidthList,

} from '@pe/builder-core';

import { EDITOR_ENABLED_MAKERS, PebEditorBehaviourAbstract } from '../../../../editor.constants';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebTextMakerSidebarComponent } from './text-maker-sidebar.component';
import { PebEditorElementAnchorsControl } from '../../../../controls/element-anchors/element-anchors.control';
import { PebEditorElementEdgesControl } from '../../../../controls/element-edges/element-edges.control';
import { replaceElementWithMaker } from '../../../_utils/makers';
import { AbstractEditElementWithSidebar, DimensionsFormValues } from '../../_sidebar.behavior';

import { diff } from 'deep-object-diff';
import { AbstractControl } from '@angular/forms';
import { PebActionResponse } from '../../../../services/interfaces';

const log = pebCreateLogger('editor:behaviors:edit-text');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditText
  extends AbstractEditElementWithSidebar<PebTextMakerSidebarComponent> implements PebEditorBehaviourAbstract  {

  static elementTypes = [PebElementType.Text];

  sidebarComponent = PebTextMakerSidebarComponent;

  logger = { log };

  constructor(
    @Inject(EDITOR_ENABLED_MAKERS) private makers: any,
    injector: Injector,
  ) {
    super(injector);
  }

  behaviourState: {
    initialElement: { element: PebElementDef, styles: PebElementStyles },
    activeElement: PebEditorElement,
    sidebar: ComponentRef<PebTextMakerSidebarComponent>,
    controls: {
      anchors: ComponentRef<PebEditorElementAnchorsControl>;
      edges: ComponentRef<PebEditorElementEdgesControl>;
    },
    maker: ComponentRef<any>,
  } = {
    initialElement: null,
    activeElement: null,
    sidebar: null,
    controls: {
      anchors: null,
      edges: null,
    },
    maker: null,
  };

  init(): Observable<any> {
    return merge(
      this.openSidebar(),
      this.startTypingWithoutMaker(),
      this.doubleClick(),
      this.state.screen$.pipe(
        // TODO: find out how to remove delay not braking sidebar reloading
        delay(10),
        switchMap(() => {
          return this.openSidebar();
        }),
      ),
      this.blurMaker$.pipe(
        tap(() => this.destroyMaker()),
      ),
    );
  }

  private openSidebar(): Observable<PebEditorElement> {
    return this.state.selectedElements$.pipe(
      map(elements => this.renderer.registry.get(elements[0])),
      filter(element => element?.definition.type === PebElementType.Text),
      map((el) => {
        if (
          this.behaviourState.activeElement
          && this.behaviourState.activeElement.definition.id !== el.definition.id
        ) {
          this.destroyMaker();
        }

        this.initPositionForm(el);
        // this.initBackgroundForm(el);
        this.initDimensionsForm(el);

        this.behaviourState.activeElement = el;
        this.behaviourState.initialElement = lodashMerge({}, {
          element: this.behaviourState.activeElement.definition,
          styles: this.behaviourState.activeElement.styles,
        });

        const sidebar = this.editor.openSidebar(this.sidebarComponent);
        sidebar.instance.mode = 'global';
        sidebar.instance.component = el;
        sidebar.changeDetectorRef.detectChanges();

        this.behaviourState.sidebar = sidebar;

        return { el, sidebar };
      }),
      switchMap(({ el, sidebar }) => merge(
        this.editTextContainerFlow(el, sidebar).pipe(
          tap(() => {
            const nextElement = el.target.element;
            const newStyles = {
              [nextElement.id]: el.target.styles,
            };
            const sync = !!nextElement.data?.sync;
            if (sync) {
              this.updateTextOnOtherScreens(nextElement);
            }
            this.store.updateElementKit(el.target.options.screen, nextElement, newStyles);
          }),
        ),
        this.handlePositionForm(el),
        this.handleTextDimensionsForm(el, sidebar),
        this.handleSynchronization(el, sidebar),
      )),
    );
  }

  private handleTextDimensionsForm(
    elCmp: PebEditorElement,
    sidebar: ComponentRef<PebTextMakerSidebarComponent>,
  ): Observable<any> {

    const elDef = elCmp.definition;
    const dimensions = elCmp.dimensions;

    if (!dimensions) {
      return EMPTY;
    }

    return merge(
      dimensions.form.valueChanges.pipe(
        startWith(null as DimensionsFormValues),
        distinctUntilChanged(isEqual),
        pairwise(),
        tap(([prevValue, value]: DimensionsFormValues[]) => {
          if (dimensions.form.invalid) {
            this.logger.log('Dimensions: Change: Invalid');
            return;
          }

          this.logger.log('Dimensions: Change: Valid ', dimensions.form.value);
          elCmp.styles.minWidth = value.width;
          elCmp.styles.minHeight = value.height;

          elCmp.applyStyles();
        }),
      ),
      dimensions.submit.pipe(
        filter(() => dimensions.form.valid && !isEqual(dimensions.initialValue, dimensions.form.value)),
        switchMap(() => {
          this.logger.log('Dimensions: Submit ', dimensions.form.value);
          elCmp.dimensions.update();
          return this.store.updateStyles(this.state.screen, {
            [elDef.id]: {
              minWidth: dimensions.form.value.width,
              minHeight: dimensions.form.value.height,
            },
          });
        }),
      ),
    );
  }

  private startTypingWithoutMaker(): Observable<any> {
    const letterPressed = (e: KeyboardEvent) => !e.metaKey && !e.ctrlKey && /^[a-zA-Z1-9]$/.test(e.key);

    const inputFocused = () => ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase());

    return this.events.window.keydown$.pipe(
      map(event => ({ event, element: this.renderer.registry.get(this.state.selectedElements[0]) })),
      filter(({ element, event }) => (
        !!this.behaviourState.activeElement
        && [PebElementType.Text].find(t => element?.definition.type === t)
        && letterPressed(event)
        && !this.renderer?.maker
        && !inputFocused()
      )),
      tap(({ event }) => this.behaviourState.activeElement.styles.content = event.key),
      tap(() => this.replaceActiveElementWithMaker()),
    );
  }

  private doubleClick(): Observable<PebEditorElement> {
    return this.events.contentContainer.dblclick$.pipe(
      map((evt: MouseEvent) => {
        return  this.renderer.getElementComponentAtEventPoint(evt);
      }),
      filter(e => !!e && e.definition.type === PebElementType.Text), tap(() => {
        window.getSelection().empty();
        this.replaceActiveElementWithMaker();
      }),
    );
  }

  private get blurMaker$(): Observable<any> {
    return this.state.selectedElements$.pipe(
      filter(elements =>
        this.renderer.maker
        && this.behaviourState.activeElement
        && elements[0] !== this.behaviourState.activeElement?.definition.id,
      ),
    );
  }

  private handleSynchronization(
    el: PebEditorElement,
    sidebar: ComponentRef<PebTextMakerSidebarComponent>,
  ): Observable<any | PebActionResponse> {
    const control: AbstractControl = sidebar.instance.settings.get('sync');
    if (el.definition.data?.sync !== null) {
      control.setValue(el.definition.data?.sync);
    }
    return control.valueChanges.pipe(
      filter(() => !this.state.makerActive),
      switchMap((value) => {
        const newElementDef: PebElementDef = {
          ...el.definition,
          data: {
            ...el.definition.data,
            sync: value,
          },
        };
        return value ?
          this.saveChanges(newElementDef) :
          this.store.updateElement(newElementDef);
      }),
    );
  }

  private editTextContainerFlow(
    el: PebEditorElement,
    sidebar: ComponentRef<PebTextMakerSidebarComponent>,
  ): Observable<any> {
    sidebar.instance.settings.patchValue(
      {
        backgroundColor: el.styles.backgroundColor,
        fill: !!el.styles.backgroundColor,
        justify: el.styles.textAlign === 'justify' ? 'full' : el.styles.textAlign,
        fontSize: el.styles.fontSize || PEB_DEFAULT_FONT_SIZE,
        bold: el.styles.fontWeight === 'bold',
        italic: el.styles.fontStyle === 'italic',
        underline: el.styles.textDecoration === 'underline',
        color: el.styles.color || PEB_DEFAULT_FONT_COLOR,
        fontFamily: el.styles.fontFamily || PEB_DEFAULT_FONT_FAMILY,
      },
      { emitEvent: false },
    );

    return merge(
      sidebar.instance.settings.get('fill').valueChanges.pipe(
        filter(v => !v),
        tap(() => {

          if (this.behaviourState.maker) {
            const textEditorContent = this.behaviourState.maker.instance.textEditorRef.iframeBody as HTMLElement;
            textEditorContent.style.backgroundColor = null;
          }

        }),
      ),
      sidebar.instance.settings.get('justify').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((textAlign: string) => {
          this.changeAlignInMaker(textAlign);
          el.styles = {
            ...el.styles,
            textAlign: textAlign === 'full' ? 'justify' : textAlign,
          };
        }),
      ),
      sidebar.instance.settings.get('fontSize').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((fontSize: string) => {
          el.styles = {
            ...el.styles,
            fontSize,
          };
        }),
      ),
      sidebar.instance.settings.get('bold').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((bold: boolean) => {
          el.styles = {
            ...el.styles,
            fontWeight: bold ? 'bold' : 'normal',
          };
        }),
      ),
      sidebar.instance.settings.get('italic').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((italic: boolean) => {
          el.styles = {
            ...el.styles,
            fontStyle: italic ? 'italic' : 'normal',
          };
        }),
      ),
      sidebar.instance.settings.get('linkPath').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((linkType: boolean) => {}),
      ),
      sidebar.instance.settings.get('linkType').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((linkType: boolean) => {}),
      ),
      sidebar.instance.settings.get('strikeThrough').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((linkType: boolean) => {}),
      ),
      sidebar.instance.settings.get('underline').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((value: boolean) => {
          el.styles = {
            ...el.styles,
            textDecoration: this.setTextDecoration(value, el.styles.textDecoration, 'underline'),
          };
        }),
      ),
      sidebar.instance.settings.get('strikeThrough').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((value: boolean) => {
          el.styles = {
            ...el.styles,
            textDecoration: this.setTextDecoration(value, el.styles.textDecoration, 'line-through'),
          };
        }),
      ),
      sidebar.instance.settings.get('color').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap((color: string) => {
          el.styles = {
            ...el.styles,
            color,
          };
        }),
      ),
      sidebar.instance.settings.get('fontFamily').valueChanges.pipe(
        filter(() => !this.behaviourState.maker),
        tap(() => {
          this.replaceActiveElementWithMaker();
          this.doubleClick();
        }),
        delay(100),
        tap(() => {
          this.behaviourState.maker.instance.textEditorRef.selectContent();
        }),
        delay(500),
        tap((fontFamily: string) => {
          sidebar.instance.settings.get('fontFamily').patchValue(fontFamily);
          this.behaviourState.maker.instance.styles.fontFamily = fontFamily;
        }),
        delay(100),
        tap(() => {
          this.destroyMaker();
          this.state.selectedElements = [this.behaviourState.initialElement.element.id];
          this.behaviourState.sidebar.instance.activeTabIndex$.next(1);
        }),
      ),
    );
  }

  private setTextDecoration (addDecoration: boolean, currentTextDecoration : string | number, decorationName: string) {
    if (addDecoration) {
      return currentTextDecoration && currentTextDecoration !== 'none' ?
        `${currentTextDecoration} ${decorationName}` : decorationName;
    }
    return currentTextDecoration?.toString().replace(decorationName, '').trim() ?? 'none';
  }

  private replaceActiveElementWithMaker() {
    this.behaviourState.activeElement.dimensions.form.disable({ emitEvent: false });

    this.behaviourState.sidebar.instance.mode = 'local';
    this.behaviourState.sidebar.instance.cdr.detectChanges();

    const maker = replaceElementWithMaker(
      this.behaviourState.activeElement,
      this.editor,
      this.renderer,
      this.makers,
      this.behaviourState.sidebar,
      this.state.scale,
    );

    this.behaviourState.maker = maker;
    this.state.makerActive = true;
  }

  // TODO: duplicated code
  private destroyMaker() {
    // TODO: Check
    if ((this.renderer.maker as any)?.instance?.element.id !== this.behaviourState.activeElement.definition.id) {
      return EMPTY;
    }

    const nextStyles = {
      ...this.behaviourState.activeElement.styles,
      ...((this.renderer.maker as any)?.instance && { ...(this.renderer.maker as any).instance.styles }),
      text: (this.renderer.maker as any)?.instance?.textEditorRef.text
          ?? this.behaviourState.activeElement.styles.content,
    };

    const nextElement = {
      ...this.behaviourState.activeElement.definition,
      data: {
        ...this.behaviourState.activeElement.definition.data,
      },
      styles: nextStyles,
    };

    this.behaviourState.activeElement = null;

    if (this.renderer.maker) {
      this.renderer.cleanMaker();
      this.behaviourState.maker = null;
    }

    if (this.behaviourState.controls.anchors) {
      this.behaviourState.controls.anchors.destroy();
      this.behaviourState.controls.edges.destroy();
      this.behaviourState.controls = {
        anchors: null,
        edges: null,
      };
    }

    this.state.makerActive = false;


    const initialElement = this.behaviourState.initialElement;
    const elementDiff = diff(initialElement.element, nextElement);
    const stylesDiff = diff(initialElement.styles, nextStyles);

    if (!Object.keys(elementDiff).length && !Object.keys(stylesDiff).length) {
      return EMPTY;
    }

    return this.saveChanges(nextElement);
  }
  private changeAlignInMaker(textAlign) {
    this.replaceActiveElementWithMaker();
    this.behaviourState.maker.instance.styles.textAlign = textAlign;
  }

  private saveChanges(nextElement): Observable<any> {
    const newStyles = {
      [nextElement.id]: nextElement.styles,
    };
    const sync = !!nextElement.data?.sync;
    if (sync) {
      return this.updateTextOnOtherScreens(nextElement);
    }
    return this.store.updateElementKit(this.state.screen, nextElement, newStyles);
  }

  private updateTextOnOtherScreens(nextElement) {
    const screenStyles = Object.values(PebScreen).reduce((acc, screen: PebScreen) => {
      const stylesheet = { ...nextElement.styles };
      if (screen !== this.state.screen) {
        // don't change position for other screens
        stylesheet.width = this.calcElementLeftWidthByScreen(nextElement, screen);
        const newStyles = Object.keys(stylesheet)
          .filter(prop => !(/^margin|gridArea$|gridColumn$/.test(prop)))
          .reduce((result, prop) => (result[prop] = stylesheet[prop], result), {});
        acc[screen] = { [nextElement.id]: newStyles };
      } else {
        acc[screen] = { [nextElement.id]: stylesheet };
      }
      return acc;
    }, {});
    return this.store.updateElementKitByScreen(nextElement, screenStyles);
  }

  calcElementLeftWidthByScreen(element, screen: PebScreen) {
    const page = this.store.snapshot.pages[this.store.activePageId];
    const stylesheetId = page.stylesheetIds[screen];
    const styleSheets = this.store.snapshot.stylesheets[stylesheetId];
    const oldMarginLeft = styleSheets[element.id].marginLeft as number;
    const calcPossibleWidth = ScreenWidthList[screen] - (oldMarginLeft + element.styles?.width);
    return calcPossibleWidth < 0 ? ScreenWidthList[screen] - oldMarginLeft : element.styles?.width;
  }
}
