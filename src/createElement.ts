import { ATTRIBUTES, CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT, XA_CONTEXT, XA_EXTRA } from './consts/attributeNames'
import { ElementExtends } from './ElementExtends'
import { TEXT_NODE } from './consts/tagNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { resolveNode } from './resolveNode'
import { updateAttribute } from './updateAttribute'

export function createElement(
  node: any,
  isSVG: Boolean,
  eventListener
): Element & ElementExtends | Node {
  const attributes = node[ATTRIBUTES] || {}

  if (node[NAME] === TEXT_NODE) {
    return document.createTextNode(deepGet(attributes, TEXT) as string)
  }

  const element = (isSVG = isSVG || node[NAME] === "svg")
    ? document.createElementNS("http://www.w3.org/2000/svg", node[NAME])
    : document.createElement(node[NAME])

  for (const name in attributes) {
    updateAttribute(element, name, attributes[name], null, isSVG, eventListener)
  }

  element.context = deepGet(attributes, CONTEXT) || attributes[CONTEXT] || {} // todo mixed to be deprecated
  element.extra = deepGet(attributes, EXTRA) || attributes[EXTRA] || {} // todo mixed to be deprecated

  return element
}
