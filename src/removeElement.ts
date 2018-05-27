import { ATTRIBUTES } from './consts'
import { removeChildren } from './removeChildren'

export function removeElement(parent, element, node) {
  function done() {
    parent.removeChild(removeChildren(element, node))
  }

  var cb = node[ATTRIBUTES] && node[ATTRIBUTES].onremove
  if (cb) {
    cb(element, done)
  } else {
    done()
  }
}
