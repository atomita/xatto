import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { FUNCTION } from './consts/typeNames'
import { CHILDREN, KEY, NAME, PROPS } from './consts/vNodeAttributeNames'
import { deepSet } from './deepSet'
import { VNode } from './VNode'

export function createVNode (
  mayBeTextNode,
  name,
  props: any = {},
  children: VNode[] = []
): VNode {
  const node: any = {}

  node[NAME] = name
  node[PROPS] = props
  node[CHILDREN] = children
  node[KEY] = props.key

  if (mayBeTextNode && FUNCTION !== typeof name) {
    node[NAME] = TEXT_NODE
    deepSet(node[PROPS], TEXT, name)
  }

  return node as VNode
}
