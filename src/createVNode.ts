import { ATTRIBUTES, CHILDREN, KEY, NAME } from './consts/vNodeAttributeNames'
import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { VNode } from './VNode'
import { deepSet } from './deepSet'
import { isVNode } from './isVNode'

export function createVNode(mayBeTextNode, name, attributes: any = {}, children: VNode[] = []): VNode {
  const node: any = {}

  node[NAME] = name
  node[ATTRIBUTES] = attributes
  node[CHILDREN] = children
  node[KEY] = attributes.key

  if (mayBeTextNode && 'function' !== typeof name) {
    node[NAME] = TEXT_NODE
    deepSet(node[ATTRIBUTES], TEXT, name)
  }

  return node as VNode
}
