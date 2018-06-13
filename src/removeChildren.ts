import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'

export function removeChildren(element, node) {
  const attributes = node[ATTRIBUTES]
  if (attributes) {
    for (let i = 0; i < node[CHILDREN].length; i++) {
      removeChildren(element.childNodes[i], node[CHILDREN][i])
    }

    if (attributes.ondestroy) {
      attributes.ondestroy(element, attributes)
    }
  }
  return element
}
