import { ATTRIBUTES } from './consts/vNodeAttributeNames'
import { removeChildren } from './removeChildren'

export function removeElement(parent, element, node) {
  function done() {
    parent.removeChild(removeChildren(element, node))
  }

  const attributes = node[ATTRIBUTES] || {}
  const cb = attributes.onremove
  if (cb) {
    cb(element, done, attributes)
  } else {
    done()
  }
}
