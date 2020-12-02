import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

import { PebElementStyles } from '@pe/builder-core';

import { PebTextEditorService, PebTextEditorStyles } from './text-editor.service';
import { FontLoaderService } from '@pe/builder-font-loader';

const observeTextMutation = (
  target: HTMLElement,
  config = { characterData: true, attributes: true, childList: true, subtree: true },
): Observable<MutationRecord[]> => {
  return new Observable((observer) => {
    const mutation = new MutationObserver((mutations, _) => {
      observer.next(mutations);
    });
    mutation.observe(target, config);

    return () => {
      mutation.disconnect();
    };
  });
};

@Component({
  selector: 'peb-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebTextEditor implements OnDestroy {
  @Input() styles: PebElementStyles;
  @Input() text: string;
  @Input() set initialDimensions(dimensions: DOMRect) {
    this.dimensions$.next(dimensions);
  }
  @Input() limits: {
    width: number,
    height: number,
  };

  @Output() textChanged = new EventEmitter<string>();
  @Output() selectionStylesChanged = new EventEmitter<PebTextEditorStyles>();
  @Output() dimensionsChanged = new EventEmitter<Partial<DOMRect>>();
  @Output() focused = new EventEmitter<null>();

  @ViewChild('iframeRef', { static: true }) iframeRef: ElementRef;

  private destroyed$ = new Subject<boolean>();

  readonly dimensions$ = new BehaviorSubject<Partial<DOMRect>>({ width: 0, height: 0 });

  constructor(
    private renderer: Renderer2,
    private textEditorService: PebTextEditorService,
    private fontLoaderService: FontLoaderService,
  ) {}

  document = document;

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get iframeDocument(): Document {
    return this.iframeRef?.nativeElement.contentDocument;
  }

  get iframeBody(): HTMLElement {
    return this.iframeRef?.nativeElement.contentDocument.body;
  }

  public selectContent(): void {
    const range = this.iframeRef?.nativeElement.contentDocument.createRange();
    range.selectNodeContents(this.iframeBody);
    const selection = this.iframeDocument.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  onIframeLoad() {
    this.textEditorService.iframeDocument = this.iframeDocument;
    this.iframeBody.innerHTML = this.text;
    this.iframeBody.contentEditable = 'true';

    this.loadFonts();
    this.setInitialStyles();
    this.moveCaretToEnd(this.iframeDocument.body);
    this.emitChanges().pipe(
      takeUntil(this.destroyed$),
    ).subscribe();


    /** Reset pasted text html styles */
    fromEvent(this.iframeBody, 'paste').pipe(
      tap((e: any) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        this.iframeDocument.execCommand('insertHTML', false, text);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private loadFonts() {
    const style = this.renderer.createElement('style');
    style.textContent = `
      .wf-loading body {
        color: transparent !important;
      }
    `;
    this.iframeDocument.head.appendChild(style);
    this.fontLoaderService.renderFontLoader(this.iframeRef.nativeElement.contentWindow);
  }

  private setInitialStyles() {

    const textEditorStyles = {
      display: 'block',

      margin: '0',
      marginTop: '0',
      marginRight: this.styles.textAlign === 'center' ? 'auto' : '0',
      marginBottom: '0',
      marginLeft: this.styles.textAlign === 'center' ? 'auto' : '0',

      // marginTop: 'auto',
      // marginRight: 'auto',
      // marginBottom: 'auto',
      // marginLeft: 'auto',
      // margin: 'auto',

      padding: '0',
      border: 'none',
      background: 'transparent',

      minWidth: 'unset',
      minHeight: 'unset',
      maxWidth: this.limits.width,

      width: 'max-content',
      height: 'max-content',
      overflow: 'hidden',
    };

    Object.entries({ ...this.styles, ...textEditorStyles }).forEach(([key, value]) => {
      this.iframeBody.style[key] = value;
    });
  }

  private moveCaretToEnd(el: HTMLElement) {
    el.focus();
    const range = this.textEditorService.iframeDocument.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = this.textEditorService.iframeDocument.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    this.focused.emit(null);
  }

  private emitChanges(): Observable<MutationRecord[] | Event> {
    return merge(
      fromEvent(this.iframeDocument, 'selectionchange').pipe(
        tap(() => this.selectionStylesChanged.emit(this.textEditorService.styles)),
      ),
      observeTextMutation(this.iframeDocument.body).pipe(
        tap(() => this.textChanged.emit(this.iframeDocument.body.innerHTML)),
        tap(() => {
          const rect = this.iframeDocument.body.getBoundingClientRect();

          const nextWidth = Math.ceil(rect.width);
          const minWidth = 20;
          const maxWidth = this.limits.width;

          const nextHeight = Math.ceil(rect.height);
          const minHeight = parseInt(this.styles.fontSize as string, 10);
          const maxHeight = this.limits.height;

          const dimensions: Partial<DOMRect> = {
            width: nextWidth < maxWidth
              ? nextWidth > minWidth
                ? nextWidth
                : minWidth
              : maxWidth,
            height: nextHeight < maxHeight
              ? nextHeight > minHeight
                ? nextHeight
                : minHeight
              : maxHeight,
          };

          this.dimensions$.next(dimensions);
          this.dimensionsChanged.emit(dimensions);
        }),
      ),
    );
  }

}
