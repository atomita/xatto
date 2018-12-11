import { ELEMENT } from './consts/glueNodeAttributeNames'
import { createGlueNode } from './createGlueNode'
import { createVNode } from './createVNode'
import { GlueNode } from './GlueNode'
import { noop } from './noop'
import { ResolvedVNode } from './ResolvedVNode'

export function createGlueNodeByElement (element: Element): GlueNode {
  const node = createGlueNode(
    createVNode(false, element.nodeName) as ResolvedVNode,
    noop,
    noop
  )
  node[ELEMENT] = element
  return node
}
