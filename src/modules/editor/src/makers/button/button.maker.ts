import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { OnInit, ViewContainerRef } from '@angular/core';

import {
  PebElementContext,
  PebElementDef,
  PebElementStyles,
  PEB_DEFAULT_FONT_COLOR,
  PEB_DEFAULT_FONT_SIZE,
  transformStyleProperty,
} from '@pe/builder-core';
import { PebRendererOptions } from '@pe/builder-renderer';

import { PebAbstractMaker } from '../abstract-maker';
import { PebTextMakerSidebarComponent } from '../../behaviors/sidebars/_deprecated-sidebars/text-maker-sidebar/text-maker-sidebar.component';
import { PebEditorElement } from '../../renderer/editor-element';

@Component({
  selector: 'peb-button-maker',
  templateUrl: './button.maker.html',
  styleUrls: ['./button.maker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebButtonMaker extends PebAbstractMaker implements OnInit, AfterViewInit {
  @Input() element: PebElementDef;
  @Input() context: PebElementContext<any>;
  @Input() options: PebRendererOptions;
  @Input() styles: PebElementStyles;

  @Input() initialRect: DOMRect;
  @Input() sidebarRef: ComponentRef<PebTextMakerSidebarComponent>;

  @Output() changes = new EventEmitter<any>()

  @ViewChild('iframeRef', { static: true }) iframeRef: ElementRef;
  @ViewChild('textEditorRef', { static: true }) textEditorRef: PebEditorElement;
  @ViewChild('CONTROLS', { static: true, read: ViewContainerRef }) controlsSlot: ViewContainerRef;

  constructor(
    elementRef: ElementRef,
    renderer2: Renderer2,
  ) {
    super(elementRef, renderer2);
  }

  ngOnInit() {
  }

  // editTextFlow(): Observable<any> {
    // return merge(
    //   this.sidebarRef.instance.settings.get('bold').valueChanges.pipe(
    //   ),
    //   this.sidebarRef.instance.settings.get('italic').valueChanges.pipe(
    //     tap(() => this.textEditorService.toggleItalic()),
    //   ),
    //   this.sidebarRef.instance.settings.get('underline').valueChanges.pipe(
    //     tap(() => this.textEditorService.toggleUnderline()),
    //   ),
    //   this.sidebarRef.instance.settings.get('strikeThrough').valueChanges.pipe(
    //     tap(() => this.textEditorService.toggleStrikeThrough()),
    //   ),
    //   this.sidebarRef.instance.settings.get('linkType').valueChanges.pipe(
    //     tap(() => this.sidebarRef.instance.settings.patchValue({ linkPath: ''}, { emitEvent: false })),
    //     tap((type: string) => this.textEditorService.changeLink(type ? { routeId: ' ', type } as any : null)),
    //   ),
    //   this.sidebarRef.instance.settings.get('linkPath').valueChanges.pipe(
    //     filter(routeId => !!routeId && routeId !== this.textEditorService.styles.link?.routeId),
    //     map(routeId => ({ routeId, type: this.sidebarRef.instance.settings.get('linkType').value })),
    //     tap((link: any) => this.textEditorService.changeLink(link)),
    //   ),
    //   this.sidebarRef.instance.settings.get('color').valueChanges.pipe(
    //     tap((value: string) => this.textEditorService.changeColor(value)),
    //   ),
    //   this.sidebarRef.instance.settings.get('fontSize').valueChanges.pipe(
    //     tap((value: any) => this.textEditorService.changeFontSize(value)),
    //   ),
    //   this.sidebarRef.instance.settings.get('fontFamily').valueChanges.pipe(
    //     tap((value: string) => this.textEditorService.changeFontFamily(value)),
    //   ),
    //   this.sidebarRef.instance.settings.get('justify').valueChanges.pipe(
    //     tap((value: TextJustify) => this.textEditorService.changeJustify(value)),
    //   ),
    // ).pipe(
    //   tap(() => this.changes.emit()),
    // );
  // }


  get editorStyles() {
    return {
      ...this.mappedStyles.host,
      background: null,
      borderStyle: null,
      borderRadius: null,
      borderWidth: null,
    }
  }

  onTextChanged(text) {
    this.changes.emit(true);
    this.element.data.text = text;
  }

  onDimensionsChanged(dimensions: DOMRect) {
    this.textEditorRef.styles.width = dimensions.width + 'px';
    this.textEditorRef.styles.height = dimensions.height + 'px';
  }

  get elements(): { [key: string]: HTMLElement } {
    return {
      host: this.nativeElement,
    };
  }

  // TODO: Should be somehow reused from original button styles because it's 100% the same
  get mappedStyles(): any {
    const styles = this.styles;
    const { scale } = this.options;
    return  {
      host: {
        display: styles.display || 'inline-flex',
        position: styles.position || 'relative',
        lineHeight: styles.lineHeight ? (+styles.lineHeight * scale + 'px') : null,
        textAlign: styles.textAlign || 'center',
        textDecoration: styles.textDecoration || null,
        fontWeight: styles.fontWeight || 'normal',
        fontStyle: styles.fontStyle || null,
        fontSize: transformStyleProperty(styles.fontSize || PEB_DEFAULT_FONT_SIZE, scale),
        fontFamily: styles.fontFamily || 'Roboto',
        borderRadius: styles.borderRadius ? (+styles.borderRadius * scale + 'px' ) : null,
        color: styles.color || '#FFF',
        justifyContent: styles.justifyContent || 'center',
        alignItems: styles.alignItems || 'center',
        borderStyle: styles.borderStyle ? styles.borderStyle : null ,
        borderColor: styles.borderColor || null,
        borderWidth: styles.borderWidth ? (+styles.borderWidth * scale + 'px') : null,
        boxShadow: styles.boxShadow || null,
        top: styles.top ? +styles.top + 'px' : '0px',
        left: styles.left ? +styles.left + 'px' : '0px',
        transform: styles.transform || null,
        cursor: this.options.interactions ? 'pointer' : 'normal',
        margin: styles.margin ? transformStyleProperty(styles.margin, scale) : null,
        overflow: styles.overflow || null,
        whiteSpace: styles.whiteSpace || null,
        textOverflow: styles.textOverflow || null,

        ...('gridArea' in styles && { gridArea: styles.gridArea }),
        ...('gridRow' in styles && { gridRow: styles.gridRow }),
        ...('gridColumn' in styles && { gridColumn: styles.gridColumn }),

        width: styles.width ? transformStyleProperty(styles.width, scale) : 'max-content',
        height: styles.height ? transformStyleProperty(styles.height, scale) : 'max-content',

        backgroundColor: 'backgroundColor' in styles ? styles.backgroundColor : PEB_DEFAULT_FONT_COLOR,

        ...('margin' in styles && { margin: transformStyleProperty(styles.margin, scale) }),
        ...('marginTop' in styles && { marginTop: +styles.marginTop * scale + 'px' }),
        ...('marginRight' in styles && { marginRight: +styles.marginRight * scale + 'px' }),
        ...('marginBottom' in styles && { marginBottom: +styles.marginBottom * scale + 'px' }),
        ...('marginLeft' in styles && { marginLeft: +styles.marginLeft * scale + 'px' }),
        ...('padding' in styles && { padding: transformStyleProperty(styles.padding, scale) }),
        ...('background' in styles && { background: styles.background }),

        minWidth: '2em',
        minHeight: '1em',
      },
    };
  }
}
