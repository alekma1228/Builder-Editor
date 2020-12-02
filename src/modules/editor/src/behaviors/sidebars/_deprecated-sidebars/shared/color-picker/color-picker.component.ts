import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, CdkOverlayOrigin,  OverlayRef } from '@angular/cdk/overlay';
import { tap, takeUntil, finalize } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef, ViewContainerRef, Pipe } from '@angular/core';

import { AbstractComponent } from '../../../../../misc/abstract.component';
import { Directionality } from '@angular/cdk/bidi';

const COLORS = [
  { name: 'Queen Blue', hex: '#6fc1f9' },
  { name: 'Waterspout', hex: '#96f9ea' },
  { name: 'Inchworm', hex: '#a5f56a' },
  { name: 'Sunny', hex: '#fffa7e' },
  { name: 'Light Salmon Pink', hex: '#f29b91' },
  { name: 'Pastel Magenta', hex: '#f094c4' },
  { name: 'Brilliant Azure', hex: '#3fa2f8' },
  { name: 'Tarquoise', hex: '#69e3cf' },
  { name: 'Dollarbill', hex: '#82d453' },
  { name: 'Minion Yellow', hex: '#FEAE00' },
  { name: 'Light Red Ochre', hex: '#ee6d57' },
  { name: 'Thulian Pink', hex: '#df6aa5' },
  { name: 'Steel Blue', hex: '#2c76b5' },
  { name: 'Keppel', hex: '#48a59d' },
  { name: 'Green (RYB)', hex: '#54ad32' },
  { name: 'Maximum Yellow Red', hex: '#f29737' },
  { name: 'Dark red', hex: '#B51700' },
  { name: 'Fuchsia Purple', hex: '#bc3c79' },
  { name: 'Dark Cerulean', hex: '#1a4d7c' },
  { name: 'Myrtle Green', hex: '#337976' },
  { name: 'Mughal Green', hex: '#306e1d' },
  { name: 'Orange', hex: '#F27200' },
  { name: 'Red Brown', hex: '#a72a17' },
  { name: 'Dark Raspberry', hex: '#8d295d' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Light Grey', hex: '#d6d5d5' },
  { name: 'Spanish Gray', hex: '#929292' },
  { name: 'Ebony', hex: '#5e5e5e' },
  { name: 'Black', hex: '#000000' },
  { name: 'Gray', hex: '#594139' },
];

@Component({
  selector: 'peb-editor-color-picker',
  templateUrl: 'color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class PebEditorColorPickerComponent extends AbstractComponent implements OnInit {
  @Input() control: FormControl = new FormControl(null);
  @Input() pebColorPicker = null;
  @Input() simple = false;

  // TODO: Remove it
  @Input() set initialValue(value) {
    this.pebColorPicker = value;
  };

  @Output() pebColorPickerChange = new EventEmitter<string>();
  @Output() changeBlur = new EventEmitter();

  @ViewChild(CdkOverlayOrigin) overlayOrigin: CdkOverlayOrigin;
  @ViewChild('colorPalette') colorPalette: TemplateRef<any>;

  overlayRef: OverlayRef | null;
  palette = COLORS.map(({ name, hex }) => ({ value: name, name, hex }));

  ngOnInit(): void {
    if (this.control?.value) {
      this.pebColorPicker = this.control.value;
    }

    this.control?.valueChanges.pipe(
      tap(value => {
        if (this.pebColorPicker !== value) {
          this.pebColorPicker = value;
        }
      }),
      takeUntil(this.destroyed$),
      finalize(() => {
        if (this.overlayRef) {
          this.overlayRef && this.overlayRef.dispose();
          this.overlayRef = null;
          this.changeBlur.emit();
        }
      })
    ).subscribe();
  }

  constructor(
    private overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public dir: Directionality,
  ) {
    super();
  }

  selectColor(color) {
    this.pebColorPicker = color;
    this.control.patchValue(color);
    this.pebColorPickerChange.emit(color);
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.changeBlur.emit();
    }
  }

  openColorBox($event) {
    $event.stopPropagation();
    if (this.overlayRef || this.control.disabled) {
      return;
    }

    const positionStrategy = this.overlay.position()
        .flexibleConnectedTo(this.overlayOrigin.elementRef)
        .withLockedPosition(true)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          panelClass: 'startBottomStartTop'
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          panelClass: 'startTopStartBottom'
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      minWidth: 270,
      minHeight: 220,
      hasBackdrop: true,
    });

    this.overlayRef.attach(new TemplatePortal(this.colorPalette, this.viewContainerRef));

    this.overlayRef.backdropClick().subscribe(() => {
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
        this.changeBlur.emit();
      }
    });
  }
}
