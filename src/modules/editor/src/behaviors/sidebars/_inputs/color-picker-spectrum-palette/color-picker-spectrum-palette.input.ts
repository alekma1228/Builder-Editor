import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  Injector,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { ColorPickerOverlayComponent } from './color-picker-spectrum-palette-overlay/color-picker-overlay.component';
import {
  ColorPickerAlphaChannelType,
  ColorPickerData,
  ColorPickerOutputFormat,
  ColorPickerPosition,
  COLOR_PICKER_DATA,
} from './color-picker-spectrum-palette-overlay/color-picker.data';
import { OVERLAY_POSITIONS } from '../../../../utils';
import { AbstractComponent } from '../../../../misc/abstract.component';

@Component({
  selector: 'editor-color-picker-spectrum-palette-input',
  templateUrl: './color-picker-spectrum-palette.input.html',
  styleUrls: ['./color-picker-spectrum-palette.input.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SidebarColorPickerSpectrumPaletteInput,
      multi: true,
    },
  ],
})
export class SidebarColorPickerSpectrumPaletteInput extends AbstractComponent implements OnDestroy {
  @Input() disabled = false;
  @Input() cpAlphaChannel: ColorPickerAlphaChannelType = 'always';
  @Input() cpOutputFormat: ColorPickerOutputFormat = 'hex';
  @Input() cpPositionOffset = '0%';
  @Input() cpPosition: ColorPickerPosition = 'auto';
  @ViewChild('colorPicker', { read: ElementRef }) colorPicker: ElementRef;
  @Output() changeBlur = new EventEmitter();

  private colorStream$ = new BehaviorSubject('#fff');

  color$: Observable<string> = this.colorStream$.asObservable()

  get color(): string {
    return this.colorStream$.value
  }

  set color(value: string) {
    this.colorStream$.next(value)
    this.onChange(value);
  }

  private overlayRef: OverlayRef;

  private onTouched = () => {};

  private onChange: (value: string) => void = () => {};

  constructor(
    private overlay: Overlay,
    private injector: Injector,
  ) {
    super()
  }

  openOverlay(isPalette = false): void {
    if (this.hasOverlayAttached()) {
      return;
    }

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.colorPicker.nativeElement)
        .withFlexibleDimensions(false)
        .withPositions(OVERLAY_POSITIONS),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      disposeOnNavigation: true,
      width: '100%',
      maxWidth: 200,
      minHeight: 330,
    });

    const injector = this.createInjector({
      color: this.color,
      disabled: this.disabled,
      cpAlphaChannel: this.cpAlphaChannel,
      cpOutputFormat: this.cpOutputFormat,
      cpPositionOffset: this.cpPositionOffset,
      cpPosition: this.cpPosition,
      isPalette,
    });
    const portal = new ComponentPortal(ColorPickerOverlayComponent, null, injector);
    const componentRef = this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().subscribe(() => this.detachOverlay());
    componentRef.instance.colorSelected.pipe(
      tap(value => {
        if (value) {
          this.color = value;
        } else {
          this.detachOverlay();
        }
      }),
    ).subscribe()
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  writeValue(value: string) {
    this.color = value;
  }


  private createInjector(data: ColorPickerData): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(COLOR_PICKER_DATA, data);
    return new PortalInjector(this.injector, injectionTokens);
  }

  private detachOverlay(): void {
    if (this.hasOverlayAttached()) {
      this.overlayRef.detach();
      this.changeBlur.emit();
    }
  };

  private hasOverlayAttached(): boolean {
    return this.overlayRef && this.overlayRef.hasAttached();
  }

  private onBlur() {
    this.onTouched();
  }

  ngOnDestroy(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
    super.ngOnDestroy()
  }
}
