import { PebEditorElement } from '../../../renderer/editor-element';

export function getColumnsAndRows(elCmp: PebEditorElement) {
  const columns = Number(elCmp.styles.productTemplateColumns || 2);
  const productTemplateColumns = elCmp.context?.data?.length
    ? columns > elCmp.context.data.length
      ? elCmp.context.data.length
      : columns
    : 1;

  const productTemplateRows = elCmp.context?.data?.length
    ? Math.ceil(elCmp.context?.data?.length / productTemplateColumns)
    : 1;

  return { productTemplateColumns, productTemplateRows };
}
