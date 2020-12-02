export enum PebScreen {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

export const PEB_DESKTOP_CONTENT_WIDTH = 1024;

export const PEB_DEFAULT_FONT_SIZE = 15;
export const PEB_DEFAULT_FONT_COLOR = '#d4d4d4';
export const PEB_DEFAULT_FONT_FAMILY = 'Roboto';

export const PebLinkDatasetLink = {
  type: 'peb-link-action',
  payload: 'peb-link-payload',
};

export const ScreenWidthList = {
  [PebScreen.Desktop]: 1280,
  [PebScreen.Tablet]: 768,
  [PebScreen.Mobile]: 360,
}
export const PEB_FONT_SIZE_ATTRIBUTE = 'peb-font-size';
