import { ATTRIBUTES, XA_CONTEXT, XA_EXTRA } from './consts'
import { removeChildren } from './removeChildren'

export function removeElement(parent, element, node) {
  function done() {
    parent.removeChild(removeChildren(element, node))
  }

  const attributes = node[ATTRIBUTES] || {}
  const cb = attributes.onremove
  if (cb) {
    cb(element, done, attributes, attributes[XA_CONTEXT], attributes[XA_EXTRA])
  } else {
    done()
  }
}
