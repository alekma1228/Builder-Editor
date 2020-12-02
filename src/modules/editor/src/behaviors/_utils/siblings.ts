export function getNextSibling(parentNode: HTMLElement, element: HTMLElement): HTMLElement {
    for(let i = 0; i < parentNode.children.length; i++) {
        if(parentNode.children[i] === element) {
            if (i+1 == parentNode.children.length) {
                return null;
            }
            let e = parentNode.children[i+1] as HTMLElement;
            return e;
        }
    }
    return null;
}