import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OverlayModule as CdkOverlayModule } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

import { PebMediaService } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { PebRendererModule } from '@pe/builder-renderer';
import { PebViewerModule } from '@pe/builder-viewer';
import { PebProductsModule } from '@pe/builder-products';
import { PebTextEditorModule } from '@pe/builder-text-editor';
import { FontLoaderService } from '@pe/builder-font-loader';

import { PebEditorScreenDialogComponent } from './toolbar/dialogs/screen/screen.dialog';
import {
  EDITOR_ENABLED_BEHAVIORS,
  EDITOR_ENABLED_MAKERS,
  PebEditorConfig,
} from './editor.constants';
import { IconsModule } from './misc/icons/_icons.module';
import { PebTextMaker } from './makers/text/text.maker';
import { PebEditor } from './root/editor.component';
import { PebEditorImageSidebar } from './behaviors/sidebars/image/image.sidebar';
import { PebEditorProductsSidebarComponent } from './behaviors/sidebars/products/products.sidebar';
import { PebEditorSectionSidebar } from './behaviors/sidebars/section/section.sidebar';
import { PebEditorShapeSidebar } from './behaviors/sidebars/shape/shape.sidebar';
import { PebEditorSnackbarComponent } from './components/snackbar/snackbar.component';
import { PebEditorCodeDialogComponent } from './toolbar/dialogs/code/code.dialog';
import { PebEditorMediaDialogComponent } from './toolbar/dialogs/media/media.dialog';
import { PebEditorObjectsDialogComponent } from './toolbar/dialogs/objects/objects.dialog';
import { PebEditorProductDialogComponent } from './toolbar/dialogs/product/product.dialog';
import { PebEditorPublishDialogComponent } from './toolbar/dialogs/publish/publish.dialog';
import { CompanyContext } from './context-services/company.context';
import { PebEditorViewDialogComponent } from './toolbar/dialogs/view/view.dialog';
import { PebEditorZoomDialogComponent } from './toolbar/dialogs/zoom/zoom.dialog';
import { PebEditorToolbarComponent } from './toolbar/toolbar.component';
import { ProductsContext } from './context-services/products.context';
import { PebEditorElementAnchorsControl } from './controls/element-anchors/element-anchors.control';
import { PebEditorElementEdgesControl } from './controls/element-edges/element-edges.control';
import { PebEditorSectionBordersControl } from './controls/section-borders/section-borders.control';
import { PebEditorElementCoordsControl } from './controls/element-coords/element-coords.control';
import { PebEditorSectionLabelsControl } from './controls/section-labels/section-labels.control';
import { PebEditorMaterialComponent } from './root/material.component';
import { defaultBehaviors, defaultMakers } from './editor.config';
import { WherePipe } from './misc/pipes/where.pipe';
import { PebButtonMaker } from './makers/button/button.maker';
import { PebEditorCreatePageDialogComponent } from './behaviors/sidebars/_deprecated-sidebars/pages/create-dialog/create-dialog.component';
import { PebEditorPagesSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/pages/pages.sidebar';
import { PebEditorButtonSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/button/button.sidebar';
import { PebEditorLineSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/line/line.sidebar';
import { PebEditorCodeSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/code/code.sidebar';
import { PebEditorSeoSidebar } from './behaviors/sidebars/_deprecated-sidebars/seo/seo.sidebar';
import { PebEditorVideoSidebarComponent } from './behaviors/sidebars/video/video.sidebar';
import { PebEditorCarouselSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/carousel/carousel.sidebar';
import { PebEditorSlidesListElementSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/carousel/components/slides-list-element/slides-list-element.component';
import { PebEditorCartSideBarComponent } from './behaviors/sidebars/_deprecated-sidebars/cart/cart.sidebar';
import { PebEditorDocumentsSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/documents/documents.sidebar';
import { PebEditorProductDetailsSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/product-details/product-details.sidebar';
import { PebEditorProductCategorySidebarComponent } from './behaviors/sidebars/product-category/product-category.sidebar';
import { PebTextMakerSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/text-maker-sidebar/text-maker-sidebar.component';
import { SidebarSharedModule } from './behaviors/sidebars/_deprecated-sidebars/shared/sidebar-shared.module';
import { PebEditorPageSidebarComponent } from './behaviors/sidebars/_deprecated-sidebars/page/page.sidebar';
import { PebEditorMenuSidebar } from './behaviors/sidebars/menu/menu.sidebar';
import { PebEditorTabsComponent } from './behaviors/sidebars/_ui/tabs/tabs.component';
import { PebEditorTabComponent } from './behaviors/sidebars/_ui/tabs/tab.component';
import { PebEditorCompileErrorDialog } from './toolbar/dialogs/compile-error/compile-error.dialog';
import { PebEditorLogoSidebar } from './behaviors/sidebars/logo/logo.sidebar';
import { PebEditorPageValidatorDialog, PebEditorPageValidatorSidebar } from './behaviors/sidebars/page-validator/page-validator.sidebar';
import { PebEditorThemeService } from './services/theme.service';

const dialogs = [
  PebEditorMediaDialogComponent,
  PebEditorObjectsDialogComponent,
  PebEditorProductDialogComponent,
  PebEditorPublishDialogComponent,
  PebEditorScreenDialogComponent,
  PebEditorZoomDialogComponent,
  PebEditorCodeDialogComponent,
  PebEditorViewDialogComponent,
  PebEditorCreatePageDialogComponent,
  PebEditorCompileErrorDialog,
];

const sidebars = [
  /** @deprecated */
  PebEditorProductsSidebarComponent,
  PebEditorPagesSidebarComponent,
  PebEditorShapeSidebar,
  PebEditorSectionSidebar,
  PebEditorButtonSidebarComponent,
  PebEditorLineSidebarComponent,
  PebEditorCodeSidebarComponent,
  PebEditorSeoSidebar,
  PebEditorImageSidebar,
  PebEditorVideoSidebarComponent,
  PebEditorCarouselSidebarComponent,
  PebEditorSlidesListElementSidebarComponent,
  PebEditorCartSideBarComponent,
  PebEditorDocumentsSidebarComponent,
  PebEditorProductDetailsSidebarComponent,
  PebEditorProductCategorySidebarComponent,
  PebTextMakerSidebarComponent,

  /** UI */
  PebEditorTabsComponent,
  PebEditorTabComponent,

  /** SIDEBARS */
  PebEditorLogoSidebar,
  PebEditorMenuSidebar,
  PebEditorPageValidatorSidebar,
];

const controls = [
  PebEditorElementAnchorsControl,
  PebEditorElementEdgesControl,
  PebEditorSectionBordersControl,
  PebEditorElementCoordsControl,
  PebEditorSectionLabelsControl,
];

const makers = [
  PebTextMaker,
  PebButtonMaker,
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const PebViewerModuleWithConfig = PebViewerModule.forRoot();

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdkOverlayModule,
    DragDropModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    NgxHmCarouselModule,
    PebRendererModule,
    PortalModule,
    SidebarSharedModule,
    IconsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    NgScrollbarModule,
    MatProgressSpinnerModule,
    PebTextEditorModule,
    PebProductsModule,
    MatExpansionModule,
    PebViewerModuleWithConfig,
  ],
  declarations: [
    PebEditor,
    PebEditorMaterialComponent,
    PebEditorPageSidebarComponent,
    PebEditorToolbarComponent,
    WherePipe,
    PebEditorPageValidatorDialog,
    PebEditorSnackbarComponent,
    ...makers,
    ...dialogs,
    ...sidebars,
    ...controls,
  ],
  providers: [
    {
      // TODO: For prod build
      provide: 'ContextServices.Products',
      useClass: ProductsContext,
    },
    {
      // TODO: For prod build
      provide: 'ContextServices.Company',
      useClass: CompanyContext,
    },
    FontLoaderService,
  ],
  exports: [PebEditor],
  entryComponents: [
    PebEditorPageValidatorDialog,
    PebEditorSnackbarComponent,
  ],
})
export class PebEditorModule {
  static forRoot(config: PebEditorConfig = {}): ModuleWithProviders {
    return {
      ngModule: PebEditorModule,
      providers: [
        {
          provide: EDITOR_ENABLED_BEHAVIORS,
          useValue: config.behaviours || defaultBehaviors,
        },
        {
          provide: EDITOR_ENABLED_MAKERS,
          useValue: config.makers || defaultMakers,
        },
        // TODO: For prod build
        {
          provide: 'ContextServices.Products',
          useClass: ProductsContext,
        },
        {
          // TODO: For prod build
          provide: 'ContextServices.Company',
          useClass: CompanyContext,
        },
        {
          provide: PebEditorThemeService,
          useClass: PebEditorThemeService,
          deps: [
            PebEditorApi,
          ],
        },
      ],
    };
  }

  constructor(@Optional() api: PebEditorApi, @Optional() media: PebMediaService) {
    if (!api) {
      throw new Error(`
        PebEditorModule requires ApiService to be provided.
        Please make sure that you've defined it.
      `);
    }
    if (!media) {
      throw new Error(`
        PebEditorModule requires MediaService to be provided.
        Please make sure that you've defined it.
      `);
    }
  }
}
