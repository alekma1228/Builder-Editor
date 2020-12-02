import { BehaviorSubject, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { PebLink, PebPageVariant } from '@pe/builder-core';
import { PebProductCategory } from '@pe/builder-api';

import { SelectOption } from '../../behaviors/sidebars/_deprecated-sidebars/shared/select/select.component';
import { SidebarSelectOption } from '../../behaviors/sidebars/_inputs/select/select.input';
import { ShadowStyles } from '../../behaviors/sidebars/_forms/shadow/shadow.interfaces';
import { VideoSubTab } from '../editor-element';
import { CategoryTypeOption } from '../../behaviors/sidebars/_forms/categories/categories.form.constants';

export interface PebBorderStyles {
  hasBorder: boolean;
  borderStyle: string;
  borderColor: string;
  borderWidth: number;
}

export interface PebRange {
  min: number;
  max: number;
}

export interface PebDimensions {
  width: number;
  height: number;
}

export interface PebLimitsDimension {
  width: BehaviorSubject<PebRange>;
  height: BehaviorSubject<PebRange>;
}

export interface PebPosition {
  x: number;
  y: number;
}

export interface PebLimitsPosition {
  x: BehaviorSubject<PebRange>;
  y: BehaviorSubject<PebRange>;
}

export interface PebBackground {
  bgColor: string;
  bgColorGradientAngle: number;
  bgColorGradientStart: string;
  bgColorGradientStop: string;
  file: File;
  bgImage: string;
  fillType: SelectOption;
  imageSize: SelectOption;
  imageScale: number;
}

export interface PebFont {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontSize: number;
  color: string;
}

export interface PebSection {
  name: string;
  sticky: boolean;
  default: boolean;
  isFirstSection: boolean;
  newElement: boolean;
}

export interface PebVideo {
  videoSubTab: VideoSubTab;
  sourceOptions: SelectOption[];
  sourceType: SelectOption;
  source: string;
  preview: string;
  file: string;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  sound: boolean;
}

export interface PebProductCategoryProperty {
  type: CategoryTypeOption;
  categories: PebProductCategory[];
}

export interface PebEditorElementProperty<T> {
  initialValue: T;
  form: FormGroup;
  update: () => void;
  submit: Subject<any>;
}

export interface PebEditorElementPropertyDimensions extends PebEditorElementProperty<PebDimensions> {
  limits: PebLimitsDimension;
  activate: () => void;
}

export interface PebEditorElementPropertyPosition extends PebEditorElementProperty<PebPosition> {
  limits: PebLimitsPosition;
}

export interface PebEditorElementPropertyBorder extends PebEditorElementProperty<PebBorderStyles> {
}

export interface PebEditorElementPropertyBackground extends PebEditorElementProperty<PebBackground> {
}

export interface PebEditorElementPropertyFont extends PebEditorElementProperty<PebFont> {
  options: {
    fontFamilies: SidebarSelectOption[],
  };
}

export interface PebEditorElementPropertyLogo extends PebEditorElementProperty<{ file: string, src: string }> {
}

export interface PebEditorElementPropertyMenuRoutes extends PebEditorElementProperty<{ menuRoutes: PebLink[] }> {
  options: {
    variants: SidebarSelectOption[],
    [PebPageVariant.Default]: SidebarSelectOption[],
    [PebPageVariant.Category]: SidebarSelectOption[],
  };
}

export interface PebEditorElementPropertyOpacity extends PebEditorElementProperty<{ opacity: number }> {
}

export interface PebEditorElementPropertyProportions extends PebEditorElementProperty<{ objectFit: string }> {
}

export interface PebEditorElementPropertySection extends PebEditorElementProperty<PebSection> {
}

export interface PebEditorElementPropertyShadow extends PebEditorElementProperty<ShadowStyles> {
}

export interface PebEditorElementPropertyVideo extends PebEditorElementProperty<PebVideo> {
}

export interface PebEditorElementPropertyCategory extends PebEditorElementProperty<PebProductCategoryProperty> {
}
