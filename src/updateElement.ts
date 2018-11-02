import { NAME, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT } from './consts/attributeNames'
import { ELEMENT, PREV_PROPS } from './consts/glueNodeAttributeNames'
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
  const props = node[PROPS]

  if (node[NAME] === TEXT_NODE) {
    element.nodeValue = deepGet(props, TEXT) as string
    return element
  }

  const prevAttributes = deepGet(node, PREV_PROPS) || {}

  for (const name in props) {
    if (
      props[name] !==
      (name === "value" || name === "checked"
        ? element[name]
        : prevAttributes[name])
    ) {
      updateAttribute(
        element,
        name,
        props[name],
        prevAttributes[name],
        isSVG,
        eventProxy
      )
    }
  }

  return element
}
