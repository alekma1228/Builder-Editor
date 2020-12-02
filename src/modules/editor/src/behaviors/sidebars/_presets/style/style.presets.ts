import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';

import { PebElementStyles } from '@pe/builder-core';

@Component({
  selector: 'editor-sidebar-style-presets',
  templateUrl: './style.presets.html',
  styleUrls: ['./style.presets.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorSidebarStylePresets implements AfterViewInit {
  @Input() source = '';
  @Input() presets: PebElementStyles[];

  @ViewChildren('preset') presetsRef: QueryList<ElementRef>;

  constructor(
    private renderer2: Renderer2,
  ) {}

  ngAfterViewInit() {
    this.applyPresetsStyles();
  }

  applyPresetsStyles() {
    this.presetsRef.forEach((presetRef, index) => {
      if (!this.presets[index]) {
        return;
      }

      Object.entries(this.presets[index]).forEach(([key, value]) => {
        this.renderer2.setStyle(
          presetRef.nativeElement,
          key,
          typeof value === 'number' ? value + 'px' : value,
        );
      })
    })
  }
}
