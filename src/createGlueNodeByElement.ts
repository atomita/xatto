import { NODE } from './consts/glueNodeAttributeNames'
import { createGlueNode } from './createGlueNode'
import { createVNode } from './createVNode'
import { GlueNode } from './GlueNode'
import { noop } from './noop'
import { ResolvedVNode } from './ResolvedVNode'

export function createGlueNodeByElement (element: Element): GlueNode {
  const glueNode = createGlueNode(
    createVNode(false, element.nodeName) as ResolvedVNode,
    noop,
    noop
  )
  glueNode[NODE] = element
  return glueNode
}
