import { AfterViewInit, Component, Input } from '@angular/core';

import { PebElementDef } from '@pe/builder-core';

import { PebAbstractElement } from '../../_abstract/abstract.element';

@Component({
  selector: 'peb-element-script',
  templateUrl: './script.element.html',
  styleUrls: ['./script.element.scss'],
})
export class PebScriptElement extends PebAbstractElement implements AfterViewInit {
  @Input() element: PebElementDef;

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
    };
  }

  get mappedStyles() {
    return {
      host: {},
    };
  }

  ngAfterViewInit() {
    this.applyStyles();

    // TODO(@dmlukichev): Execution of the script should happen only once despite possible repaints
    eval(this.element.data.script);
  }
}
