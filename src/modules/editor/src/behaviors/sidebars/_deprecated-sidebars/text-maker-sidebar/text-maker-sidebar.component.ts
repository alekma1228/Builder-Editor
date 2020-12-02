import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Renderer2, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { PebShopRoute, PebShopThemeSnapshot, PEB_DEFAULT_FONT_FAMILY, PEB_DEFAULT_FONT_SIZE, PebScreen, ScreenWidthList } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { PebInteractionType, PebLinkDatasetLink, PebPageType } from '@pe/builder-core';

import {
  borderVariables,
  colorPaletteVariables,
  fillNamesVariables,
  fontNamesVariables,
  fontStylesVariables,
  linkVariables,
  paragraphStylesVariables,
} from './default-variables';
import { SidebarBasic } from '../sidebar.basic';
import { PebEditorStore } from '../../../../services/editor.store';
import { PebEditorElement } from '../../../../renderer/editor-element';
import { PebTextEditorService } from '@pe/builder-text-editor';
import { PageSidebarDefaultOptions } from '../sidebar.utils';
import { delay } from 'lodash';

@Component({
  selector: 'peb-text-maker-sidebar',
  templateUrl: './text-maker-sidebar.component.html',
  styleUrls: [
    './text-maker-sidebar.component.scss',
    '../sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebTextMakerSidebarComponent extends SidebarBasic implements OnInit, OnDestroy {

  @Input()
  mode: 'global'|'local';

  @Input() component: PebEditorElement;

  @Output()
  settingsChange = new EventEmitter<any>();

  @Output()
  arrangeChange = new EventEmitter<any>();

  @Output()
  changeStyle = new EventEmitter<any>();

  PebInteractionType = PebInteractionType;
  minFontSize = 1;

  arrangeForm: FormGroup = new FormGroup({
    size: new FormGroup({
      width: new FormControl(0),
      height: new FormControl(0),
    }),
    position: new FormGroup({
      posX: new FormControl(0),
      posY: new FormControl(0),
    }),
    angle: new FormControl(0),
    flipX: new FormControl(0),
    flipY: new FormControl(0),
  });

  settings: FormGroup = new FormGroup({
    afterParagraph: new FormControl(false),
    alignItems: new FormControl('flex-start'),
    background: new FormControl('inherit'),
    backgroundColor: new FormControl('inherit'),
    beforeParagraph: new FormControl(false),
    border: new FormControl(false),
    borderColor: new FormControl('#000000'),
    borderWeight: new FormControl(1),
    borderName: new FormControl('solid'),
    fill: new FormControl(false),
    fillStyle: new FormControl('colorFill'),
    color: new FormControl('#000000'),
    fontFamily: new FormControl(PEB_DEFAULT_FONT_FAMILY),
    fontSize: new FormControl(PEB_DEFAULT_FONT_SIZE),
    fontStyle: new FormControl('Regular'),
    justifyContent: new FormControl('flex-start'),
    linkType: new FormControl(null),
    linkPath: new FormControl(''),
    paragraphStyle: new FormControl(''),
    shadow: new FormControl(false),
    shadowAngle: new FormControl(315),
    shadowBlur: new FormControl(2),
    shadowColor: new FormControl('#000000'),
    shadowOffset: new FormControl(2),
    shadowOpacity: new FormControl(100),
    spacing: new FormControl(false),
    justify: new FormControl('left'),
    bold: new FormControl(false),
    italic: new FormControl(false),
    strikeThrough: new FormControl(false),
    underline: new FormControl(false),
    sync: new FormControl(false),
  });

  fontNames = fontNamesVariables;
  fontStyles = fontStylesVariables;
  colorPalette = colorPaletteVariables;
  fillNames = fillNamesVariables;
  paragraphStyles = paragraphStylesVariables;
  borderNames = borderVariables;
  linkNames = linkVariables;

  activeTabIndex$ = new BehaviorSubject<number>(0);

  constructor(
    private store: PebEditorStore,
    public api: PebEditorApi,
    public cdr: ChangeDetectorRef,
    private textEditorService: PebTextEditorService,
    public renderer2: Renderer2,
  ) {
    super(api);
  }

  readonly routes$: Observable<any> = this.store.snapshot$.pipe(
    filter(Boolean),
    map((snapshot: PebShopThemeSnapshot) =>
      snapshot.shop.routing.reduce((acc, route: PebShopRoute) => {
        if (snapshot.pages[route?.pageId]?.type !== PebPageType.Master) {
          acc.push({
            title: snapshot.pages[route.pageId]?.name,
            path: route.routeId,
            route: route.url,
          });
        }
        return acc;
      }, []),
    ),
  );

  ngOnInit() {
    this.settingsChange.emit(this.settings);
    this.arrangeChange.emit(this.arrangeForm);

    const cmpContent = this.component.nativeElement.getElementsByClassName('content')[0];
    const attrs = cmpContent.querySelectorAll('[peb-link-action]')[0]?.attributes;

    if (attrs) {
      this.settings.get('linkType').patchValue(attrs['peb-link-action']?.value);
      this.settings.get('linkPath').patchValue(attrs['peb-link-payload']?.value);
    }
    const strike = cmpContent.getElementsByTagName('strike')[0];
    if (strike) {
      this.settings.get('strikeThrough').patchValue(true);
    }
    setTimeout(() => {
      const underline = cmpContent.getElementsByTagName('u')[0];
      if (underline) {
        this.settings.get('underline').patchValue(true);
      }
    });
    merge(
      // this.settings.get('fontFamily').valueChanges,
      this.settings.get('fill').valueChanges.pipe(
        map((fill) => {
          const color = fill ? this.component.background.form.get('bgColor').value
            || PageSidebarDefaultOptions.BgColor : null;
          this.component.background.form.get('bgColor').patchValue(color);
        }),
      ),
      this.settings.get('linkType').valueChanges.pipe(
        tap(() => this.settings.patchValue({ linkPath: '' }, { emitEvent: false })),
        tap((type: string) => {
          const contentElement = this.component.nativeElement.getElementsByClassName('content')[0];
          const font = contentElement.getElementsByTagName('font')[0];
          if (type) {
            this.settings.get('underline').patchValue(true);
            if (font) {
              const link = font.querySelectorAll('[peb-link-action], a')[0];
              font.innerHTML = `<a ${PebLinkDatasetLink.type}="${type}" ${PebLinkDatasetLink.payload}=" " style="color: rgb(0, 0, 0); text-decoration: none;" href="#">${link ? link.innerHTML : this.component.nativeElement.textContent}</a>`;
              const content = `<u>${font.outerHTML}</u>`;
              this.component.setTextContent(content, this.component.target.constructor.name);
            } else {
              const link = contentElement.querySelectorAll('[peb-link-action], a')[0];
              const content = `<u><a ${PebLinkDatasetLink.type}="${type}" ${PebLinkDatasetLink.payload}=" " style="color: rgb(0, 0, 0); text-decoration: none;" href="#">${link ? link.innerHTML : this.component.nativeElement.textContent}</a></u>`;
              this.component.setTextContent(content, this.component.target.constructor.name);
            }
          } else {
            this.settings.get('underline').patchValue(false);
            if (font) {
              font.innerHTML = this.component.nativeElement.textContent;
              this.component.setTextContent(font.outerHTML, this.component.target.constructor.name);
            } else {
              const content = this.component.nativeElement.textContent;
              this.component.setTextContent(content, this.component.target.constructor.name);
            }
          }
          this.component.detectChanges();
        }),
      ),
      this.settings.get('linkPath').valueChanges.pipe(
        map(payload => ({ payload, type: this.settings.get('linkType').value })),
        tap((path: any) => {
          if (path.type === PebInteractionType.NavigateInternal) {
            this.setLinkPath();
          }
        }),
      ),
      this.settings.get('underline').valueChanges.pipe(
        tap((value) => {
          const contentElement = this.component.nativeElement.getElementsByClassName('content')[0];
          const underlineElement = contentElement.getElementsByTagName('u')[0];
          const parentNode = contentElement.children[0];
          if (underlineElement && value) {
            return
          }
          if (underlineElement) {
            if (parentNode.nodeName === 'U') {
              this.component.setTextContent(underlineElement.innerHTML, this.component.target.constructor.name);
            } else {
              parentNode.innerHTML = underlineElement.innerHTML;
              this.component.setTextContent(parentNode.outerHTML, this.component.target.constructor.name);
            }
          } else {
            const content = parentNode
              ? `<u>${parentNode.outerHTML}</u>`
              : `<u>${contentElement.innerHTML}</u>`;
            this.component.setTextContent(content, this.component.target.constructor.name);
          }
          this.component.detectChanges();
        }),
      ),
      this.settings.get('strikeThrough').valueChanges.pipe(
        tap(() => {
          const contentElement = this.component.nativeElement.getElementsByClassName('content')[0];
          const strike = contentElement.getElementsByTagName('strike')[0];
          if (strike) {
            strike.parentElement.innerHTML = strike.innerHTML;
            this.component.setTextContent(contentElement.innerHTML, this.component.target.constructor.name);
          } else {
            const underlineElement = contentElement.getElementsByTagName('u')[0];
            if (underlineElement) {
              const font = underlineElement.getElementsByTagName('font')[0];
              if (font) {
                font.innerHTML = `<strike>${font.innerHTML}</strike>`;
                this.component.setTextContent(font.outerHTML, this.component.target.constructor.name);
              } else {
                underlineElement.innerHTML = `<strike>${underlineElement.innerHTML}</strike>`;
                this.component.setTextContent(underlineElement.outerHTML, this.component.target.constructor.name);
              }
            } else {
              const font = contentElement.getElementsByTagName('font')[0];
              if (font) {
                font.innerHTML = `<strike>${font.innerHTML}</strike>`;
                this.component.setTextContent(font.outerHTML, this.component.target.constructor.name);
              } else {
                const content = `<strike>${contentElement.innerHTML}</strike>`;
                this.component.setTextContent(content, this.component.target.constructor.name);
              }
            }
          }
          this.component.detectChanges();
        }),
      ),
    ).pipe(
      tap(changes => this.changeStyle.emit(changes)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  setLinkPath() {
    const contentElement = this.component.nativeElement.getElementsByClassName('content')[0];
    const link = contentElement.querySelectorAll('[peb-link-action], a')[0];
    if (link) {
      link.setAttribute(PebLinkDatasetLink.payload, this.settings.get('linkPath').value);
    }
    const content = this.component.nativeElement.getElementsByClassName('content')[0].innerHTML;
    this.component.setTextContent(content, this.component.target.constructor.name);
  }

  changeControl(control, value) {
    this.settings.get(control).setValue(value);
  }

  setItalic() {
    this.settings.get('italic').setValue(!this.settings.get('italic').value);
  }

  setBold() {
    this.settings.get('bold').setValue(!this.settings.get('bold').value);
  }

  setUnderline() {
    this.settings.get('underline').setValue(!this.settings.get('underline').value);
  }

  setStrikeThrough() {
    this.settings.get('strikeThrough').setValue(!this.settings.get('strikeThrough').value);
  }

  setBackgroundColor(color: string) {
    this.component.background.form.get('bgColor').patchValue(color);
    this.settings.get('fill').patchValue(true);
    this.cdr.detectChanges();
  }
  ngOnDestroy() {
    this.setLinkPath();
  }
}
