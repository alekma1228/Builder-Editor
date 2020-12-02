import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PebElementDef, PebElementStyles, PebElementType } from '@pe/builder-core';

@Component({
  selector: 'peb-editor-code-sidebar',
  templateUrl: 'code.sidebar.html',
  styleUrls: [
    './code.sidebar.scss',
    '../sidebars.scss',
  ],
})
export class PebEditorCodeSidebarComponent {
  @Input() element: PebElementDef;

  @Input() styles: PebElementStyles;

  @Output() changeCode = new EventEmitter<PebElementDef>();

  PebElementType = PebElementType;

  get code(): string {
    return this.element.type === PebElementType.Html ? this.element.data.innerHTML : this.element.data.script;
  }

  onCodeChange(event: any): void {
    const code = event.target.value;
    this.element.type === PebElementType.Html ? this.element.data.innerHTML = code : this.element.data.script = code;
    this.changeCode.emit(this.element);
  }
}
