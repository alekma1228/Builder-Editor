import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class PebThemesApi {
  abstract getThemesList(): Observable<any>;

  abstract getThemeById(themeId: string): Observable<any>;

  abstract getTemplateThemes(): Observable<any>;

  abstract duplicateTemplateTheme(themeId: string): Observable<any>;

  abstract deleteTemplateTheme(themeId: string): Observable<void>;

  abstract instantInstallTemplateTheme(themeId: string): Observable<any>;

  abstract installTemplateTheme(themeId: string): Observable<any>;

}
