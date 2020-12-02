import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkPortal } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';

import { PebTheme } from '@pe/builder-core';
import { PebEditorApi, PEB_EDITOR_API_PATH } from '@pe/builder-api';

import { SandboxRootComponent } from '../root/root.component';
import { SandboxMockBackend } from '../../dev/editor.api-local';

@Component({
  selector: 'sandbox-editor-route',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxEditorRootComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CdkPortal) editorTools: CdkPortal;

  constructor(
    public route: ActivatedRoute,
    public root: SandboxRootComponent,
    public api: PebEditorApi,
    private http: HttpClient,
    private injector: Injector,
  ) {}

  ngAfterViewInit() {
    if (this.api instanceof SandboxMockBackend) {
      return;
    }

    this.root.customToolsPortal = this.editorTools;
    this.root.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.root.customToolsPortal = null;
  }

  get theme(): PebTheme {
    return (this.route.data as any).value.shop.theme;
  }

  get themeType() {
    const themeType = this.theme.type;

    return themeType || 'not-set';
  }

  setTemplateThemeType() {
    if (this.theme.type) {
      return;
    }

    if (!confirm(`
      This will transform theme type to template.
      Do you want to continue?
    `)) {
      return;
    }

    // const industry = prompt('For which industry this theme is for?');
    // if (industry.length <= 3) {
    //   return alert('Industry name is too short');
    // }

    const apiPath = this.injector.get(PEB_EDITOR_API_PATH);
    this.http.post(`${apiPath}/api/${this.theme.id}/template`, {
      codeGroup: 'BUSINESS_PRODUCT_RETAIL_B2C',
      codeItem: 'BRANCHE_FASHION',
      order: 1,
      type: 'product',
    }).toPromise().then(() => {
      location.reload();
    });
  }
}
