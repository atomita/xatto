import { CHILDREN } from './consts/vNodeAttributeNames'
import { CREATE } from './consts/lifecycleNames'
import { GlueNode } from './GlueNode'
import { ResolvedVNode } from './ResolvedVNode'
import { LIFECYCLE, PREV_PROPS } from './consts/glueNodeAttributeNames'
import { Props } from './Props'
import { deepSet } from './deepSet'

export function createGlueNode(
  vNode: ResolvedVNode
): GlueNode {
  const newGlueNode = { ...vNode } as any
  newGlueNode.i = 0
  newGlueNode[LIFECYCLE] = CREATE
  newGlueNode[CHILDREN] = vNode[CHILDREN].map(child => createGlueNode(child))
  deepSet(newGlueNode, PREV_PROPS, {})
  return newGlueNode as GlueNode
}
