import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { PebEditorElement } from '../../renderer/editor-element';
import { PebAbstractEditor } from '../../root/abstract-editor';

export const THREE_ANCHORS_MIN_SIZE = 20;

type AnchorsVariant = 'default'|'invalid'|'hidden';

export const colorForControl = (variant: AnchorsVariant) => ({
  default: '#067AF1',
  invalid : '#ff1744',
  hidden: 'transparent',
}[variant]);

export enum AnchorType {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right',
}

@Component({
  selector: 'peb-editor-controls-anchors',
  templateUrl: './element-anchors.control.html',
  styleUrls: ['./element-anchors.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorElementAnchorsControl {
  AnchorType = AnchorType;

  PebElementType = PebElementType;

  @Input()
  component: PebEditorElement;

  @Input()
  variant: 'default'|'invalid'|'hidden' = 'default';

  @Input()
  selected: boolean = true;

  dimensions: {
    width: number;
    height: number;
    top: number;
    left: number;
  };

  anchorSize = 9;

  points = [];

  constructor(
    private elementRef: ElementRef,
    public cdr: ChangeDetectorRef,
  ) {}

  static construct(editor: PebAbstractEditor, element: PebEditorElement) {
    const control = editor.createControl(PebEditorElementAnchorsControl);

    control.instance.component = element;
    control.instance.detectChanges();

    element.controlsSlot.insert(control.hostView);
    element.controls.anchors = control;

    return control;
  }

  get elementDefinition() {
    return this.component.definition ?? (this.component as any)?.element; /* element or maker */
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

    this.points = this.createElementPoints();
    this.cdr.detectChanges();
  }

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  get elementId() {
    return this.elementDefinition.id;
  }

  get width() {
    return this.dimensions?.width;
  }

  get height() {
    return this.dimensions?.height;
  }

  get top() {
    return this.dimensions?.top;
  }

  get left() {
    return this.dimensions?.left;
  }

  get canShowThreeXAnchors() {
    return this.anchorSize * 3 <= this.width;
  }

  get canShowThreeYAnchors() {
    return this.anchorSize * 3 <= this.height;
  }

  get color() {
    return colorForControl(this.variant);
  }

  getAnchorTypeClass(type: AnchorType): string {
    if ([AnchorType.MiddleLeft, AnchorType.MiddleRight].includes(type)) {
      return 'ew';
    } else if ([AnchorType.TopCenter, AnchorType.BottomCenter].includes(type)) {
      return 'ns';
    } else if ([AnchorType.TopLeft, AnchorType.BottomRight].includes(type)) {
      return 'nwse';
    } else if ([AnchorType.TopRight, AnchorType.BottomLeft].includes(type)) {
      return 'nesw';
    }
  }

  getAddSectionAnchorTypeClass(type: AnchorType):string{
    if(type == AnchorType.TopCenter) {
      return "before";
    } else {
      return "after";
    }
  }

  private createElementPoints() {
    const { width, height } = this.dimensions;

    const points = [
      {
        type: AnchorType.TopLeft,
        x: 0,
        y: 0,
        shown: this.selected && ![PebElementType.Section, PebElementType.Text].includes(this.elementDefinition.type) ,
      },
      {
        type: AnchorType.TopCenter,
        x: width / 2,
        y: 0,
        shown: width > THREE_ANCHORS_MIN_SIZE,
      },
      {
        type: AnchorType.TopRight,
        x: width,
        y: 0,
        shown: this.selected && ![PebElementType.Text, PebElementType.Section].includes(this.elementDefinition.type),
      },
      {
        type: AnchorType.MiddleRight,
        x: width,
        y: height / 2,
        shown: this.selected && height > THREE_ANCHORS_MIN_SIZE && ![PebElementType.Section].includes(this.elementDefinition.type),
      },
      {
        type: AnchorType.BottomRight,
        x: width,
        y: height,
        shown: this.selected && ![PebElementType.Text, PebElementType.Section].includes(this.elementDefinition.type),
      },
      {
        type: AnchorType.BottomCenter,
        x: width / 2,
        y: height,
        shown: width > THREE_ANCHORS_MIN_SIZE,
      },
      {
        type: AnchorType.BottomLeft,
        x: 0,
        y: height,
        shown: this.selected && ![PebElementType.Text, PebElementType.Section].includes(this.elementDefinition.type),
      },
      {
        type: AnchorType.MiddleLeft,
        x: 0,
        y: height / 2,
        shown: this.selected && height > THREE_ANCHORS_MIN_SIZE && ![PebElementType.Section].includes(this.elementDefinition.type),
      },
    ];

    return points;
  }
}
