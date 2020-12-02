import { Component, Input, ElementRef, ChangeDetectorRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { PebElementType } from '@pe/builder-core';
import { PebEditorElement } from '../../renderer/editor-element';
import { PebAbstractEditor } from '../../root/abstract-editor';

@Component({
  selector: 'peb-editor-controls-section-labels',
  templateUrl: 'section-labels.control.html',
  styleUrls:['section-labels.control.scss'],
})
export class PebEditorSectionLabelsControl {
  @Input()
  component: PebEditorElement;

  labelText = 'Section';

  constructor(public cdr: ChangeDetectorRef) {}

  static construct(editor: PebAbstractEditor, element: PebEditorElement) {
    if (element.definition?.type !== PebElementType.Section)
      return null;

    const control = editor.createControl(PebEditorSectionLabelsControl);

    control.instance.component = element;
    control.instance.detectChanges();

    element.controlsSlot.insert(control.hostView);
    element.controls.labels = control;

    return control;
  }

  @HostListener('click', ['$event'])
  onLabelClick(event: Event) {
    event.stopPropagation();
  }

  detectChanges() {
    this.labelText = this.component.definition.data?.name;

    this.cdr.detectChanges();
  }

}
