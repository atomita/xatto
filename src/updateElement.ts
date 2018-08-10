import { ATTRIBUTES, NAME } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT, XA_CONTEXT, XA_EXTRA } from './consts/attributeNames'
import { ELEMENT, PREV_ATTRIBUTES } from './consts/glueNodeAttributeNames'
import { ElementExtends } from './ElementExtends'
import { TEXT_NODE } from './consts/tagNames'
import { deepGet } from './deepGet'
import { updateAttribute } from './updateAttribute'

export function updateElement(
  node: any,
  isSVG: Boolean,
  eventProxy
): Element & ElementExtends | Node {
  const element = node[ELEMENT]
  const attributes = node[ATTRIBUTES]

  if (node[NAME] === TEXT_NODE) {
    element.nodeValue = deepGet(attributes, TEXT) as string
    return element
  }

  const prevAttributes = deepGet(node, PREV_ATTRIBUTES) || {}

  for (const name in attributes) {
    if (
      attributes[name] !==
      (name === "value" || name === "checked"
        ? element[name]
        : prevAttributes[name])
    ) {
      updateAttribute(
        element,
        name,
        attributes[name],
        prevAttributes[name],
        isSVG,
        eventProxy
      )
    }
  }

  element.context = deepGet(attributes, CONTEXT) || attributes[XA_CONTEXT] || {} // todo mixed to be deprecated
  element.extra = deepGet(attributes, EXTRA) || attributes[XA_EXTRA] || {} // todo mixed to be deprecated

  return element
}
