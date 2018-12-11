import { NAME, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT } from './consts/attributeNames'
import { ELEMENT, PREV_PROPS } from './consts/glueNodeAttributeNames'
import { Props } from './Props'
import { TEXT_NODE } from './consts/tagNames'
import { GlueNode } from './GlueNode'
import { deepGet } from './deepGet'
import { updateAttribute } from './updateAttribute'

export function updateNode(
  glueNode: GlueNode,
  isSVG: Boolean,
  eventProxy: (e: Event) => void,
  eventTargetProps: WeakMap<EventTarget, Props>
): [Node, boolean] {
  const node = glueNode[ELEMENT]!
  const props = glueNode[PROPS]
  const prevProps = deepGet(glueNode, PREV_PROPS) || {}

  let updated = false

  if (glueNode[NAME] === TEXT_NODE) {
    const value = deepGet(props, TEXT) as string
    const oldValue = deepGet(prevProps, TEXT) as string

    updated = value != oldValue
    if (updated) {
      node.nodeValue = deepGet(props, TEXT) as string
    }
    return [node, updated]
  }

  for (const name in props) {
    if (
      props[name] !==
      (name === "value" || name === "checked"
        ? node[name]
        : prevProps[name])
    ) {
      updateAttribute(
        node as Element,
        name,
        props[name],
        prevProps[name],
        isSVG,
        eventProxy
      )
      updated = true
    }
  }

  eventTargetProps.set(node, props)

  return [node, updated]
}
