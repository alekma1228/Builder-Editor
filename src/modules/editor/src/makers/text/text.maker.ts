import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { merge, Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { ViewContainerRef } from '@angular/core';

import {
  PebElementContext,
  PebElementDef,
  PebElementStyles,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
  transformStyleProperty,
 } from '@pe/builder-core';
import { PebRendererOptions } from '@pe/builder-renderer';
import { PebTextEditorService, PebTextEditorStyles, TextJustify } from '@pe/builder-text-editor';

import { PebAbstractMaker } from '../abstract-maker';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebTextMakerSidebarComponent } from '../../behaviors/sidebars/_deprecated-sidebars/text-maker-sidebar/text-maker-sidebar.component';

@Component({
  selector: 'peb-text-maker',
  templateUrl: './text.maker.html',
  styleUrls: ['./text.maker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebTextMaker extends PebAbstractMaker implements OnInit, AfterViewInit {
  @Input() element: PebElementDef;
  @Input() context: PebElementContext<any>;
  @Input() options: PebRendererOptions;
  @Input() styles: PebElementStyles;

  @Output() changes = new EventEmitter<any>()

  @ViewChild('iframeRef', { static: true }) iframeRef: ElementRef;
  @ViewChild('textEditorRef', { static: true }) textEditorRef: ElementRef;
  @ViewChild('CONTROLS', { static: true, read: ViewContainerRef }) controlsSlot: ViewContainerRef;

  parentRect: DOMRect;

  constructor(
    elementRef: ElementRef,
    renderer2: Renderer2,
    private textEditorService: PebTextEditorService,
    private renderer: PebEditorRenderer,
  ) {
    super(elementRef, renderer2);
  }

  @Input() initialRect: DOMRect;
  @Input() sidebarRef: ComponentRef<PebTextMakerSidebarComponent>;

  ngOnInit() {
    this.parentRect =
      this.renderer.registry.get((this.element as any).parent.id).contentContainer.getBoundingClientRect();

    this.editTextFlow().pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  editTextFlow(): Observable<any> {
    return merge(
      this.sidebarRef.instance.settings.get('bold').valueChanges.pipe(
        tap(() => this.textEditorService.toggleBold()),
      ),
      this.sidebarRef.instance.settings.get('italic').valueChanges.pipe(
        tap(() => this.textEditorService.toggleItalic()),
      ),
      this.sidebarRef.instance.settings.get('underline').valueChanges.pipe(
        tap(() => this.textEditorService.toggleUnderline()),
      ),
      this.sidebarRef.instance.settings.get('strikeThrough').valueChanges.pipe(
        tap(() => this.textEditorService.toggleStrikeThrough()),
      ),
      this.sidebarRef.instance.settings.get('linkType').valueChanges.pipe(
        tap(() => this.sidebarRef.instance.settings.patchValue({ linkPath: ''}, { emitEvent: false })),
        tap((type: string) => this.textEditorService.changeLink(type ? { payload: ' ', type } as any : null)),
      ),
      this.sidebarRef.instance.settings.get('linkPath').valueChanges.pipe(
        filter(payload => !!payload && payload !== this.textEditorService.styles.link?.payload),
        map(payload => ({ payload, type: this.sidebarRef.instance.settings.get('linkType').value })),
        tap((link: any) => this.textEditorService.changeLink(link)),
      ),
      this.sidebarRef.instance.settings.get('color').valueChanges.pipe(
        tap((value: string) => this.textEditorService.changeColor(value)),
      ),
      this.sidebarRef.instance.settings.get('fontSize').valueChanges.pipe(
        tap((value: any) => this.textEditorService.changeFontSize(value)),
      ),
      this.sidebarRef.instance.settings.get('fontFamily').valueChanges.pipe(
        tap((value: string) => this.textEditorService.changeFontFamily(value)),
      ),
      this.sidebarRef.instance.settings.get('justify').valueChanges.pipe(
        tap((value: TextJustify) => this.textEditorService.changeJustify(value)),
      ),
    ).pipe(
      tap(() => this.changes.emit()),
    );
  }

  onTextFocused() {
    this.sidebarRef.instance.activeTabIndex$.next(1);
  }

  onTextChanged(text: string) {
    this.changes.emit(true);
    this.styles.content = text;
  }

  onSelectionStylesChanged(styles: PebTextEditorStyles) {
    this.sidebarRef.instance.settings.patchValue({
      ...styles,
      fontSize: styles.fontSize || parseInt(this.mappedStyles.host.fontSize, 10) || 1,
      linkType: styles.link?.type,
      linkPath: styles.link?.payload,
    }, { onlySelf: true, emitEvent: false });

    this.sidebarRef.changeDetectorRef.detectChanges();
  }

  onDimensionsChanged(dimensions: DOMRect) {

    this.styles = {
      ...this.styles,
      width: dimensions.width / this.options.scale,
      height: dimensions.height / this.options.scale,
    }

    this.nativeElement.style.width = dimensions.width + 'px';
    this.nativeElement.style.height = dimensions.height + 'px';
  }

  get elements(): { [key: string]: HTMLElement } {
    return {
      host: this.nativeElement,
    };
  }

  getContent(): string {
    return this.styles.content ?? this.element.data.text;
  }

  // TODO: Should be somehow shared with text element styles because it's 100% the same
  get mappedStyles() {
    const styles = this.styles as any;
    const { scale } = this.options;

    return  {
      host: {
        position: 'relative',
        top: styles.top ? +styles.top + 'px' : '0px',
        left: styles.left ? +styles.left + 'px' : '0px',
        display: styles.display ? styles.display : 'inline-block',
        color: styles.color,
        fontSize: transformStyleProperty(styles.fontSize || PEB_DEFAULT_FONT_SIZE, scale),
        fontWeight: styles.fontWeight,
        justifyContent: styles.justifyContent || 'center',
        transform: styles.transform || null,
        background: styles.background ? styles.background : null,
        fontFamily: styles.fontFamily || PEB_DEFAULT_FONT_FAMILY,
        textDecoration: styles.textDecoration || null,
        boxShadow: styles.boxShadow || null,
        textShadow: styles.textShadow ? styles.textShadow : null,
        border: styles.border ? styles.border : null,
        alignItems: styles.alignItems ? styles.alignItems : null,
        flexDirection: 'column',

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),

        padding: styles.padding ? transformStyleProperty(styles.padding, scale) : null,
        backgroundColor: styles.backgroundColor || null,
        overflowWrap: styles.overflowWrap || null,

        textAlign: 'textAlign' in styles ? styles.textAlign : 'left',
        width: styles.width ? transformStyleProperty(styles.width, scale) : 'max-content',
        height: styles.height ? transformStyleProperty(styles.height, scale) : 'max-content',

        ...('fontStyle' in styles && { fontStyle: styles.fontStyle }),
        ...('textDecoration' in styles && { textDecoration: styles.textDecoration }),

        minWidth: styles.minWidth ? transformStyleProperty(styles.minWidth, scale) : 'initial',
        maxWidth: styles.maxWidth ? transformStyleProperty(styles.maxWidth, scale) : 'initial',

        minHeight: styles.minHeight ? transformStyleProperty(styles.minHeight, scale) : 'initial',
      },
    };
  }
}
