import { RECYCLE } from './consts/attributeNames'
import { getAttributes } from './getAttributes'

const map = [].map

export function recycleElement(element) {
  const attributes = getAttributes(element)
  attributes[RECYCLE] = true
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
