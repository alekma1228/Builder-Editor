import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

import { PebEditorElement } from '../../renderer/editor-element';
import { PebAbstractEditor } from '../../root/abstract-editor';

export interface PebEditorControl {
  component: PebEditorElement;
}

@Component({
  selector: 'peb-editor-controls-element-coords',
  templateUrl: 'element-coords.control.html',
  styleUrls: ['element-coords.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorElementCoordsControl implements PebEditorControl {

  @Input()
  component: PebEditorElement;

  constructor(private cdr: ChangeDetectorRef) {}

  static construct(editor: PebAbstractEditor, element: PebEditorElement) {
    const control = editor.createControl(PebEditorElementCoordsControl);

    control.instance.component = element;
    control.instance.detectChanges();

    element.controlsSlot.insert(control.hostView);
    element.controls.coords = control;

    return control;
  }

  detectChanges() {
    this.cdr.detectChanges();
  }

  get top(): number {
    return this.component.getAbsoluteElementRect().top;
  }

  get left(): number {
    return this.component.getAbsoluteElementRect().left;
  }
}
