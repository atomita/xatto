import { ELEMENT } from './consts/glueNodeAttributeNames'
import { GlueNode } from './GlueNode'
import { ResolvedVNode } from './ResolvedVNode'
import { createGlueNode } from './createGlueNode'
import { createVNode } from './createVNode'

export function createGlueNodeByElement(element: Element): GlueNode {
  const node = createGlueNode(createVNode(false, element.nodeName) as ResolvedVNode)
  node[ELEMENT] = element
  return node
}
