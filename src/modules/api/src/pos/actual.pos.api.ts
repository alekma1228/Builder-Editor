import { Observable } from 'rxjs';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { omit } from 'lodash';

import { PebEnvService } from '@pe/builder-core';

import { PebPosApi, PosPreviewDTO } from './abstract.pos.api';
import {
  IntegrationInfoInterface,
  IntegrationConnectInfoInterface,
  AccessConfigDto,
  Terminal,
} from './interfaces';
import { tap } from 'rxjs/operators';

export const PEB_POS_API_PATH = new InjectionToken<string>('PEB_POS_API_PATH');
export const PEB_BUILDER_POS_API_PATH = new InjectionToken<string>(
  'PEB_BUILDER_POS_API_PATH',
);
export const PEB_CONNECT_API_PATH = new InjectionToken<string>(
  'PEB_CONNECT_API_PATH',
);

@Injectable()
export class PebActualPosApi implements PebPosApi {
  constructor(
    @Inject(PEB_POS_API_PATH) private posApiPath: string,
    @Inject(PEB_BUILDER_POS_API_PATH) private builderPosApiPath: string,
    @Inject(PEB_CONNECT_API_PATH) private connectApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  private get terminalId() {
    return this.envService.terminalId;
  }

  getTerminalsList(isDefault?: boolean): Observable<Terminal[]> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal`;

    return this.http.get<Terminal[]>(endpoint, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getSingleTerminal(terminalId: string): Observable<Terminal> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${terminalId}`;

    return this.http.get<Terminal>(endpoint);
  }

  createTerminal(payload: any): Observable<Terminal> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal`;

    return this.http.post<Terminal>(endpoint, payload);
  }

  deleteTerminal(terminalId: string): Observable<null> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${terminalId}`;

    return this.http.delete<null>(endpoint);
  }

  updateTerminal(payload: any): Observable<any> {
    const terminalId = payload.id;
    const body = omit(payload, ['id']);
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${terminalId}`;

    return this.http.patch<any>(endpoint, body);
  }

  updateTerminalDeploy(
    accessId: string,
    payload: Partial<AccessConfigDto>,
  ): Observable<any> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/access/${accessId}`;

    return this.http.patch<any>(endpoint, payload);
  }

  getTerminalPreview(terminalId: string): Observable<any> {
    const endpoint = `${this.builderPosApiPath}/business/${this.businessId}/terminal/${terminalId}/preview`;

    return this.http.get<any>(endpoint);
  }

  markTerminalAsActive(terminalId: string): Observable<any> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${terminalId}/active`;
    return this.http.patch<any>(endpoint, {});
  }

  getIntegrationsInfo(
    businessId: string,
  ): Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(
      `${this.posApiPath}/business/${businessId}/integration`,
    );
  }

  getIntegrationInfo(
    businessId: string,
    integration: string,
  ): Observable<IntegrationInfoInterface> {
    return this.http.get<IntegrationInfoInterface>(
      `${this.posApiPath}/business/${businessId}/integration/${integration}`,
    );
  }

  getConnectIntegrationInfo(
    integrationId: string,
  ): Observable<IntegrationConnectInfoInterface> {
    return this.http.get<IntegrationConnectInfoInterface>(
      `${this.connectApiPath}/integration/${integrationId}`,
    );
  }

  getTerminalEnabledIntegrations(
    businessId: string,
    terminalId: string,
  ): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.posApiPath}/business/${businessId}/terminal/${terminalId}/integration`,
    );
  }

  toggleTerminalIntegration(
    businessId: string,
    terminalId: string,
    integrationName: string,
    enable: boolean,
  ): Observable<void> {
    return this.http.patch<void>(
      `${
        this.posApiPath
      }/business/${businessId}/terminal/${terminalId}/integration/${integrationName}/${
        enable ? 'install' : 'uninstall'
      }`,
      {},
    );
  }

  getTerminalActiveTheme(terminalId: string): Observable<any> {
    return this.http.get<any>(
      `${this.builderPosApiPath}/business/${this.businessId}/terminal/${terminalId}/themes/active`,
    );
  }

  getTerminalThemes(terminalId: string, businessId: string): Observable<any[]> {
    return this.http.get<any>(
      `${this.builderPosApiPath}/business/${businessId}/terminal/${terminalId}/themes`,
    );
  }

  getTerminalThemeVersions(themeId: string): Observable<any[]> {
    return this.http.get<any>(
      `${this.builderPosApiPath}/theme/${themeId}/versions`,
    );
  }

  createTerminalThemeVersion(themeId: string, name: string): Observable<any> {
    return this.http.post<any>(
      `${this.builderPosApiPath}/theme/${themeId}/version`,
      { name },
    );
  }

  deleteTerminalThemeVersion(
    themeId: string,
    versionId: string,
  ): Observable<any> {
    return this.http.delete(
      `${this.builderPosApiPath}/theme/${themeId}/version/${versionId}`,
    );
  }

  publishTerminalThemeVersion(
    themeId: string,
    versionId: string,
  ): Observable<any> {
    return this.http.put(
      `${this.builderPosApiPath}/theme/${themeId}/version/${versionId}/publish`,
      {},
    );
  }

  instantSetup(): Observable<any> {
    return this.http.put(
      `${this.builderPosApiPath}/business/${this.businessId}/terminal/${this.terminalId}/instant-setup`,
      {},
    );
  }
}
