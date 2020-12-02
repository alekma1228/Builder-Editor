import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';

import { PebThemesApi } from './abstract.themes.api';
import { PEB_BUILDER_POS_API_PATH } from '../pos/actual.pos.api';
import { map } from 'rxjs/operators';

@Injectable()
export class PebActualTerminalThemesApi implements PebThemesApi {
  get terminalId(): string {
    return this.envService.terminalId;
  }

  get businessId(): string {
    return this.envService.businessId;
  }

  constructor(
    @Inject(PEB_BUILDER_POS_API_PATH) private editorApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) {}

  getThemesList(): Observable<any> {
    const endpoint = `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/themes`;

    return this.http.get(endpoint);
  }

  getThemeById(themeId: string): Observable<any> {
    return this.http.get(`${this.editorApiPath}/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  duplicateTemplateTheme(themeId: string): Observable<any> {
    return this.http.put<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/terminal/${this.terminalId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<any> {
    return this.http.put<any>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/business/${this.businessId}/terminal/${this.terminalId}/theme/${themeId}/install`,
      {},
    );
  }
}
