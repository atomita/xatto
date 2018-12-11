import { CHILDREN, NAME, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT } from './consts/attributeNames'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { TEXT_NODE } from './consts/tagNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { updateAttribute } from './updateAttribute'

export function createNode(
  glueNode: GlueNode,
  isSVG: Boolean,
  eventProxy: (e: Event) => void,
  eventTargetProps: WeakMap<EventTarget, Props>
): Element | Node {
  const props = glueNode[PROPS] || {}

  if (glueNode[NAME] === TEXT_NODE) {
    return document.createTextNode(deepGet(props, TEXT) as string)
  }

  const node = (isSVG = isSVG || glueNode[NAME] === "svg")
    ? document.createElementNS("http://www.w3.org/2000/svg", glueNode[NAME])
    : document.createElement(glueNode[NAME])

  for (const name in props) {
    updateAttribute(node, name, props[name], null, isSVG, eventProxy)
  }

  eventTargetProps.set(node, props)

  return node
}
