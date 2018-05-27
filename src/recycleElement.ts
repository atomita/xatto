import { XA_RECYCLE } from './consts'
import { getAttributes } from './getAttributes'

const map = [].map

export function recycleElement(element) {
  const attributes = getAttributes(element)
  attributes[XA_RECYCLE] = true
  return {
    nodeName: element.nodeName.toLowerCase(),
    attributes,
    children: map.call(
      element.childNodes,
      element => element.nodeType === 3 // Node.TEXT_NODE
        ? element.nodeValue
        : recycleElement(element)
    )
  }
}
