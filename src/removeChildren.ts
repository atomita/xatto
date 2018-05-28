import { ATTRIBUTES, CHILDREN, XA_CONTEXT, XA_EXTRA } from './consts'

export function removeChildren(element, node) {
  const attributes = node[ATTRIBUTES]
  if (attributes) {
    for (let i = 0; i < node[CHILDREN].length; i++) {
      removeChildren(element.childNodes[i], node[CHILDREN][i])
    }

    if (attributes.ondestroy) {
      attributes.ondestroy(element, attributes, attributes[XA_CONTEXT], attributes[XA_EXTRA])
    }
  }
  return element
}
