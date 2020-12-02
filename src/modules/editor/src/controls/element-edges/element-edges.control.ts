import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { PebEditorElement } from '../../renderer/editor-element';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { colorForControl } from '../element-anchors/element-anchors.control';

@Component({
  selector: 'peb-editor-controls-borders',
  templateUrl: './element-edges.control.html',
  styleUrls: ['./element-edges.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorElementEdgesControl {
  dimensions: {
    width: number,
    height: number,
    top: number,
    left: number,
  };

  @Input()
  component: PebEditorElement;

  @Input()
  type: 'selected'|'hovered';

  @Input()
  valid = true;

  constructor(
    private editor: PebAbstractEditor,
    private elementRef: ElementRef,
    public cdr: ChangeDetectorRef,
  ) {}

  static construct(editor: PebAbstractEditor, element: PebEditorElement) {
    const control = editor.createControl(PebEditorElementEdgesControl);

    control.instance.component = element;
    control.instance.detectChanges();

    element.controlsSlot.insert(control.hostView);
    element.controls.edges = control;

    return control;
  }

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  detectChanges() {
    // TODO: check
    if (!this.component?.nativeElement) {
      return;
    }

    const elementNode = this.component.nativeElement;
    const elementDs = elementNode.getBoundingClientRect()

    const borderWidth = elementNode.style.borderWidth ? parseInt(elementNode.style.borderWidth, 10) : 0;

    this.dimensions = {
      width: elementDs.width,
      height: elementDs.height,
      top: 0 - borderWidth,
      left: 0 - borderWidth,
    };

    this.cdr.detectChanges();
  }

  makeBordersPath(): string {
    const { width, height } = this.dimensions;

    return `
      M 0 0
      L ${width} 0
      L ${width} ${height}
      L 0 ${height}
      L 0 0
    `;
  }

  get color() {
    return colorForControl(this.valid ? 'default' : 'invalid');
  }

  get strokeWidth(): number {
    if (this.component.definition?.type === PebElementType.Section)
      return 2;
    else
      return 1;
  }
}
