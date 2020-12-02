import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface PebEditorConfig {
  behaviours?: any[];
  makers?: {[elementType: string]: any};
}

export interface PebEditorBehaviourAbstract {
  init(): Observable<any>;
}

export const EDITOR_ENABLED_BEHAVIORS = new InjectionToken<any[]>(
  'EDITOR_ENABLED_BEHAVIORS',
);

export const EDITOR_ENABLED_MAKERS = new InjectionToken<{ [element: string]: any }>(
  'EDITOR_ENABLED_MAKERS',
)

export const EDITOR_DESKTOP_CONTENT_WIDTH = 1024;
