import { PebEditorElement } from '../../renderer/editor-element';

export function showImageSpinner(isLoading: boolean, element: PebEditorElement): void {
  const loadersArr = element.nativeElement.getElementsByClassName('loading-spinner-wrapper');
  const loader = loadersArr ? loadersArr[0] : null;
  if (loader) {
    if (isLoading) {
      loader.classList.add('show');
    } else {
      loader.classList.remove('show');
    }
  }
}
