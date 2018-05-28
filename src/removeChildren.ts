import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA } from './consts/attributeNames'

export function removeChildren(element, node) {
  const attributes = node[ATTRIBUTES]
  if (attributes) {
    for (let i = 0; i < node[CHILDREN].length; i++) {
      removeChildren(element.childNodes[i], node[CHILDREN][i])
    }

    if (attributes.ondestroy) {
      attributes.ondestroy(element, attributes, attributes[CONTEXT], attributes[EXTRA])
    }
  }
  return element
}
