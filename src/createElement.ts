import { CHILDREN, NAME, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT } from './consts/attributeNames'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { TEXT_NODE } from './consts/tagNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { updateAttribute } from './updateAttribute'

export function createElement(
  node: GlueNode,
  isSVG: Boolean,
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>
): Element | Node {
  const props = node[PROPS] || {}

  if (node[NAME] === TEXT_NODE) {
    return document.createTextNode(deepGet(props, TEXT) as string)
  }

  const element = (isSVG = isSVG || node[NAME] === "svg")
    ? document.createElementNS("http://www.w3.org/2000/svg", node[NAME])
    : document.createElement(node[NAME])

  for (const name in props) {
    updateAttribute(element, name, props[name], null, isSVG, eventProxy, elementProps)
  }

  elementProps.set(element, props)

  return element
}
