import { PebScreen } from '@pe/builder-core';
import { InjectionToken } from '@angular/core';

// TODO: Probably this can go to @pe/builder-core and used across entire builder
export type ScreenThresholds = {
  [screen in PebScreen]: [number, number];
}

export const defaultScreenThresholds: ScreenThresholds = {
  [PebScreen.Mobile]: [320, 640],
  [PebScreen.Tablet]: [640, 1200],
  [PebScreen.Desktop]: [1200, Infinity],
}

export const SCREEN_THRESHOLDS = new InjectionToken<ScreenThresholds>('SCREEN_THRESHOLDS');

export const SCREEN_FROM_WIDTH = new InjectionToken<(width: number) => PebScreen>('SCREEN_FROM_WIDTH');

// TODO: Move BUILDER_APP_STATE to @pe/builder-core

export const BUILDER_APP_STATE_SERVICE = new InjectionToken<any>('BUILDER_APP_STATE_SERVICE');
