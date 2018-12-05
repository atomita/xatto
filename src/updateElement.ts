import { NAME, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT } from './consts/attributeNames'
import { ELEMENT, PREV_PROPS } from './consts/glueNodeAttributeNames'
import { Props } from './Props'
import { TEXT_NODE } from './consts/tagNames'
import { GlueNode } from './GlueNode'
import { deepGet } from './deepGet'
import { updateAttribute } from './updateAttribute'

export function updateElement(
  node: GlueNode,
  isSVG: Boolean,
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>
): [Element | Node, boolean] {
  const element: Element | Node = node[ELEMENT]!
  const props = node[PROPS]
  const prevProps = deepGet(node, PREV_PROPS) || {}

  let updated = false

  if (node[NAME] === TEXT_NODE) {
    const value = deepGet(props, TEXT) as string
    const oldValue = deepGet(prevProps, TEXT) as string

    updated = value != oldValue
    if (updated) {
      element.nodeValue = deepGet(props, TEXT) as string
    }
    return [element as Node, updated]
  }

  for (const name in props) {
    if (
      props[name] !==
      (name === "value" || name === "checked"
        ? element[name]
        : prevProps[name])
    ) {
      updateAttribute(
        element as Element,
        name,
        props[name],
        prevProps[name],
        isSVG,
        eventProxy
      )
      updated = true
    }
  }

  elementProps.set(element as Element, props)

  return [element as Element, updated]
}
