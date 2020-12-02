import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { OverlayModule as CdkOverlayModule } from '@angular/cdk/overlay';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { MatButtonModule } from '@angular/material/button';

import { ColorPickerModule } from '@pe/color-picker';

import { IconsModule } from '../../../../misc/icons/_icons.module';
import { PebEditorCarouselComponent } from './carousel/carousel.component';
import { PebEditorNumberInputComponent } from './number-input/number-input.component';
import { PebEditorSliderComponent } from './slider/slider.component';
import { PebEditorAnglePickerComponent } from './angle-picker/angle-picker.component';
import { PebEditorBorderSelectComponent } from './border-select/border-select.component';
import { PebEditorArrangeTabComponent } from './arrange-tab/arrange-tab.component';
import { PebEditorSelectComponent } from './select/select.component';
import { PebEditorMediaTabComponent } from './media-tab/media-tab.component';
import { PebEditorGradientPickerComponent } from './gradient-picker/gradient-picker.component';
import { PebEditorColorPickerComponent } from './color-picker/color-picker.component';
import { PebEditorColorPaletteComponent } from './color-palette/color-palette.component';
import { PebEditorSVGBorderSelectComponent } from './svg-border-select/svg-border-select.component';
import { PebEditorAccordionDirective } from './accordion/accordion.directive';
import { ClickAndHoldDirective } from '../../../../misc/directives/click-and-hold.directive';
import { SidebarNumberInput } from '../../_inputs/number/number.input';
import { SidebarTextInput } from '../../_inputs/text/text.input';
import { EditorDimensionsForm } from '../../_forms/dimensions/dimensions.form';
import { EditorProportionDimensionsForm } from '../../_forms/proportion-dimensions/proportion-dimensions.form';
import { EditorPositionForm } from '../../_forms/position/position.form';
import { EditorImageForm } from '../../_forms/image/image.form';
import { EditorVideoForm } from '../../_forms/video/video.form';
import { SidebarFileInput } from '../../_inputs/file/file.input';
import { EditorOpacityForm } from '../../_forms/opacity/opacity.form';
import { SidebarSliderInput } from '../../_inputs/slider/slider.input';
import { PebEditorSidebarStylePresets } from '../../_presets/style/style.presets';
import { PebEditorExpandablePanelComponent } from '../../_ui/expandable-panel/expandable-panel.component';
import { EditorShadowForm } from '../../_forms/shadow/shadow.form';
import { EditorBackgroundForm } from '../../_forms/background/background.form';
import { EditorFontForm } from '../../_forms/font/font.form';
import { PebEditorDynamicFieldsComponent } from '../../_ui/dynamic-fields/dynamic-fields.component';
import { EditorMenuRoutesForm } from '../../_forms/menu-routes/menu-routes.form';
import { SidebarSelectInput } from '../../_inputs/select/select.input';
import { PebEditorDynamicFieldComponent } from '../../_ui/dynamic-fields/dynamic-field.component';
import { EditorProportionsForm } from '../../_forms/proportions/proportions.form';
import { EditorBorderForm } from '../../_forms/border/border.form';
import { SidebarCheckboxInput } from '../../_inputs/checkbox/checkbox.input';
import { SidebarColorPickerSpectrumPaletteInput } from '../../_inputs/color-picker-spectrum-palette/color-picker-spectrum-palette.input';
import { ColorPickerOverlayComponent } from '../../_inputs/color-picker-spectrum-palette/color-picker-spectrum-palette-overlay/color-picker-overlay.component';

import 'hammerjs';
import { EditorCategoriesForm } from "../../_forms/categories/categories.form"

const components = [
  PebEditorAnglePickerComponent,
  PebEditorBorderSelectComponent,
  PebEditorCarouselComponent,
  PebEditorNumberInputComponent,
  PebEditorSliderComponent,
  PebEditorArrangeTabComponent,
  PebEditorSelectComponent,
  PebEditorMediaTabComponent,
  PebEditorGradientPickerComponent,
  PebEditorColorPickerComponent,
  PebEditorColorPaletteComponent,
  PebEditorSVGBorderSelectComponent,
  PebEditorAccordionDirective,
  ClickAndHoldDirective,
  PebEditorSidebarStylePresets,
  PebEditorExpandablePanelComponent,
  PebEditorDynamicFieldsComponent,
  PebEditorDynamicFieldComponent,
  ColorPickerOverlayComponent,
];

const inputs = [
  SidebarNumberInput,
  SidebarFileInput,
  SidebarSliderInput,
  SidebarTextInput,
  SidebarSelectInput,
  SidebarCheckboxInput,
  SidebarColorPickerSpectrumPaletteInput,
];

const forms = [
  EditorDimensionsForm,
  EditorPositionForm,
  EditorProportionDimensionsForm,
  EditorImageForm,
  EditorVideoForm,
  EditorOpacityForm,
  EditorShadowForm,
  EditorBackgroundForm,
  EditorFontForm,
  EditorMenuRoutesForm,
  EditorProportionsForm,
  EditorBorderForm,
  EditorCategoriesForm,
];

@NgModule({
  declarations: [
    components,
    ...inputs,
    ...forms,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxHmCarouselModule,
    IconsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    CdkOverlayModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ColorPickerModule,
  ],
  exports: [
    components,
    ...inputs,
    ...forms,
  ],
})
export class SidebarSharedModule {}
