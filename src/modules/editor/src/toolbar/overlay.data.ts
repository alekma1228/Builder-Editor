import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';

import { PebScreen } from '@pe/builder-core';

import { EditorSidebarTypes, PebEditorState } from '../services/editor.state';
import { PebEditorStore } from '../services/editor.store';
import { ObjectCategory } from './dialogs/objects/objects.dialog';
export type OverlayDataValue = ObjectCategory | PebScreen | EditorSidebarTypes | number;
export interface OverlayData {
  emitter: Subject<OverlayDataValue>;
  data: any | PebEditorState | PebEditorStore;
}
export const OVERLAY_DATA = new InjectionToken<OverlayData>('OVERLAY_DATA');
