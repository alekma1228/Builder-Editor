import { PebElementType } from '@pe/builder-core';

import { PebEditorBehaviorMarkHovered } from './behaviors/general/mark-hovered.behavior';
import { PebEditorBehaviorEditSection } from './behaviors/sidebars/section/edit-section.behavior';
import { PebEditorBehaviorMarkSelectedElement } from './behaviors/general/mark-selected.behavior';
import { PebEditorBehaviorAddElement } from './behaviors/general/add-element.behavior';
import { PebEditorBehaviorPositioning } from './behaviors/general/positioning.behavior';
import { PebTextMaker } from './makers/text/text.maker';
import { PebEditorBehaviorElementManipulation } from './behaviors/general/element-manipulation.behavior';
import { PebEditorBehaviorMoveWithMouse } from './behaviors/transforming/move-with-mouse.behavior';
import { PebEditorBehaviorResizeByKeyboard } from './behaviors/transforming/resize-with-keyboard.behavior';
import { PebEditorBehaviorResizeWithMouse } from './behaviors/transforming/resize-with-mouse.behavior';
import { PebButtonMaker } from './makers/button/button.maker';
import { PebEditorBehaviorEditShape } from './behaviors/sidebars/shape/edit-shape.behavior';
import { PebEditorBehaviorEditImage } from './behaviors/sidebars/image/edit-image.behavior';
import { PebEditorBehaviorEditCode } from './behaviors/sidebars/_deprecated-sidebars/code/edit-code.behaviour';
import { PebEditorBehaviorEditText } from './behaviors/sidebars/_deprecated-sidebars/text-maker-sidebar/edit-text.behavior';
import { PebEditorBehaviorEditLine } from './behaviors/sidebars/_deprecated-sidebars/line/edit-line.behavior';
import { PebEditorBehaviorEditButton } from './behaviors/sidebars/_deprecated-sidebars/button/edit-button.behavior';
import { PebEditorBehaviorEditSeo } from './behaviors/sidebars/_deprecated-sidebars/seo/edit-seo.behavior';
import { PebEditorBehaviorEditVideo } from './behaviors/sidebars/video/edit-video.behavior';
import { PebEditorBehaviorEditPage } from './behaviors/sidebars/_deprecated-sidebars/page/edit-page.behavior';
import { PebEditorBehaviorEditCart } from './behaviors/sidebars/_deprecated-sidebars/cart/edit-cart.behavior';
import { PebEditorBehaviorEditCarousel } from './behaviors/sidebars/_deprecated-sidebars/carousel/edit-carousel.behavior';
import { PebEditorBehaviorEditProductDetails } from './behaviors/sidebars/_deprecated-sidebars/product-details/edit-product-details.behavior';
import { PebEditorBehaviorEditProducts } from './behaviors/sidebars/products/edit-products.behavior';
import { PebEditorBehaviorEditProductCategory } from './behaviors/sidebars/product-category/edit-product-category.behavior';
import { PebEditorLogoBehavior } from './behaviors/sidebars/logo/logo.behavior';
import { PebEditorMenuBehavior } from './behaviors/sidebars/menu/menu.behavior';
import { PebEditorPageValidatorBehavior } from './behaviors/sidebars/page-validator/page-validator.behavior';
import { PebEditorBehaviorResizeSection } from './behaviors/transforming/resize-section.behavior';

export const defaultBehaviors = [
  PebEditorBehaviorMarkHovered,
  PebEditorBehaviorMarkSelectedElement,
  PebEditorBehaviorEditShape,
  PebEditorBehaviorEditSection,
  PebEditorBehaviorEditCode,
  PebEditorBehaviorEditText,
  PebEditorBehaviorAddElement,
  PebEditorBehaviorEditLine,
  PebEditorBehaviorEditButton,
  PebEditorBehaviorEditSeo,
  PebEditorBehaviorPositioning,
  PebEditorBehaviorEditImage,
  PebEditorBehaviorEditVideo,
  PebEditorBehaviorEditPage,
  PebEditorBehaviorEditCart,
  PebEditorBehaviorEditCarousel,
  PebEditorBehaviorEditProductDetails,
  PebEditorBehaviorElementManipulation,
  PebEditorBehaviorEditProducts,
  PebEditorBehaviorEditProductCategory,
  PebEditorBehaviorMoveWithMouse,
  PebEditorBehaviorResizeByKeyboard,
  PebEditorBehaviorResizeWithMouse,
  PebEditorLogoBehavior,
  PebEditorMenuBehavior,
  PebEditorPageValidatorBehavior,
  PebEditorBehaviorResizeSection,
];

export const defaultMakers = {
  [PebElementType.Text]: PebTextMaker,
  [PebElementType.Button]: PebButtonMaker,
};
