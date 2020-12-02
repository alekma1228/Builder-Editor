import { PebEditorElementSection } from '../elements/editor-element-section';
import { PebEditorElement } from '../editor-element';
import { PebEditorElementVideo } from '../elements/editor-element-video';

export const isSectionElement = (value: PebEditorElement): value is PebEditorElementSection =>
  value instanceof PebEditorElementSection;

export const isVideoElement = (value: PebEditorElement): value is PebEditorElementVideo =>
  value instanceof PebEditorElementVideo;
