import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { OBJECT } from './consts/typeNames'
import { NAME, PROPS } from './consts/vNodeAttributeNames'
import { deepGet } from './deepGet'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { updateAttribute } from './updateAttribute'

export function createNode (
  glueNode: GlueNode,
  isSVG: Boolean,
  eventProxy: (e: Event) => void,
  eventTargetProps: WeakMap<EventTarget, Props>
): Element | Node {
  const props = glueNode[PROPS] || {}

  if (glueNode[NAME] === TEXT_NODE) {
    return document.createTextNode(deepGet(props, TEXT) as string)
  }

  isSVG = isSVG || glueNode[NAME] === 'svg'

  const node = isSVG
    ? document.createElementNS('http://www.w3.org/2000/svg', glueNode[NAME])
    : document.createElement(glueNode[NAME])

  for (const name in props) {
    if (OBJECT != typeof props[name]) {
      updateAttribute(node, name, props[name], null, isSVG, eventProxy)
    }
  }

  eventTargetProps.set(node, props)

  return node
}
