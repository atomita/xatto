import { ATTRIBUTES } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA } from './consts/attributeNames'
import { removeChildren } from './removeChildren'

export function removeElement(parent, element, node) {
  function done() {
    parent.removeChild(removeChildren(element, node))
  }

  const attributes = node[ATTRIBUTES] || {}
  const cb = attributes.onremove
  if (cb) {
    cb(element, done, attributes, attributes[CONTEXT], attributes[EXTRA])
  } else {
    done()
  }
}
