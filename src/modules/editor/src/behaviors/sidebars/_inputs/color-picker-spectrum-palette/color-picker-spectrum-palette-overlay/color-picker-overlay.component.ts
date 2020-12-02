import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { matDatepickerAnimations } from '@angular/material/datepicker';

import {
  ColorPickerAlphaChannelType,
  ColorPickerData, ColorPickerOutputFormat,
  ColorPickerPosition,
  COLOR_PICKER_DATA,
} from './color-picker.data';

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
  selector: 'peb-color-picker-overlay',
  templateUrl: './color-picker-overlay.component.html',
  styleUrls: ['./color-picker-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [matDatepickerAnimations.fadeInCalendar, matDatepickerAnimations.transformPanel],
})
export class ColorPickerOverlayComponent implements OnInit {
  @Output() colorSelected = new EventEmitter<string>();
  disabled = false;
  cpAlphaChannel: ColorPickerAlphaChannelType = 'always';
  cpOutputFormat: ColorPickerOutputFormat = 'hex';
  cpPositionOffset = '0%';
  cpPosition: ColorPickerPosition = 'auto';
  selectedColor: string;
  palette = COLORS.map(({ name, hex }) => ({ value: name, name, hex }));

  private readonly firstSelectedColor: string;

  constructor(@Inject(COLOR_PICKER_DATA) public data: ColorPickerData) {
    this.disabled = data.disabled;
    this.cpAlphaChannel = data.cpAlphaChannel;
    this.cpOutputFormat = data.cpOutputFormat;
    this.cpPositionOffset = data.cpPositionOffset;
    this.cpPosition = data.cpPosition;
    this.selectedColor = data.color;
    this.firstSelectedColor = data.color;
  }

  ngOnInit() {}

  setColorValue(color: string): void {
    this.colorSelected.emit(color);
    this.selectedColor = color;
  }

  submitColor(): void {
    this.setColorAndClose(this.selectedColor);
  }

  cancelColor(): void {
    this.setColorAndClose(this.firstSelectedColor);
  }

  setColorAndClose(color: string): void {
    this.colorSelected.emit(color);
    // Close the overlay
    this.colorSelected.emit();
  }
}
