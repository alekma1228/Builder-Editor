import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DomSanitizer } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';

import { Slide } from '../../carousel.sidebar';

@Component({
  selector: 'peb-editor-slides-list-element',
  templateUrl: './slides-list-element.component.html',
  styleUrls: ['./slides-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorSlidesListElementSidebarComponent implements OnInit, OnChanges {
  @Input() slide: Slide;
  @Input() selected: boolean;
  @Input() isLoading: boolean;
  @Input() uploadProgress: number;

  @Output() deleteSlide = new EventEmitter<any>();
  @Output() selectSlide = new EventEmitter<any>();
  @Output() replaceToOwnImage = new EventEmitter<any>();
  @Output() replaceToMediaImage = new EventEmitter<any>();

  @ViewChild('slideFormControl') inputElement: ElementRef;
  @ViewChild('expanded') expandedMenu: TemplateRef<any>;

  // TODO: Create this form control dynamically only when mode turns into 'edit'
  control: FormControl;
  mode: 'show'|'edit' = 'show';

  private overlayRef: OverlayRef;

  constructor(
    private overlay: Overlay,
    private sanitizer: DomSanitizer,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit() {
    this.control = new FormControl(this.slide.title);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.currentValue) {
      this.mode = 'show';
    }
  }

  onSelectSlide() {
    this.selectSlide.emit();
  }

  onDelete() {
    this.closeContextMenu();
    this.deleteSlide.emit();
  }

  onReplaceToOwn() {
    this.closeContextMenu();
    this.replaceToOwnImage.emit();
  }

  onReplaceFromMedia() {
    this.closeContextMenu();
    this.replaceToMediaImage.emit();
  }

  toggleEditMode() {
    if (this.selected) {
      this.mode = 'edit';
      this.inputElement.nativeElement.focus();
    }
  }

  openContextMenu(event: MouseEvent) {
    if ((window as any).PEB_CONTEXT_MENUS_DISABLED) {
      console.warn(
        'Context menus are disabled.\n'
        + 'Activate them by setting "PEB_CONTEXT_MENUS_DISABLED = false"',
      );
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(event)
        .withPositions([{
          originX: 'center',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'bottom',
        }]),
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
    ).subscribe();
    this.overlayRef.attach(new TemplatePortal(this.expandedMenu, this.viewContainerRef));
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
