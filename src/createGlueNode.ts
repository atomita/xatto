import { assign } from './assign'
import { LIFECYCLE, PREV_PROPS } from './consts/glueNodeAttributeNames'
import { CREATE } from './consts/lifecycleNames'
import { CHILDREN } from './consts/vNodeAttributeNames'
import { deepSet } from './deepSet'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { ResolvedVNode } from './ResolvedVNode'

export function createGlueNode (
  vNode: ResolvedVNode,
  next: Function,
  recursion: Function
): GlueNode {
  const newGlueNode = assign({}, vNode)
  newGlueNode.i = 0
  newGlueNode[LIFECYCLE] = CREATE
  newGlueNode[CHILDREN] = vNode[CHILDREN].map((child) =>
    recursion(CREATE, child)
  )
  deepSet(newGlueNode, PREV_PROPS, {})
  return newGlueNode as GlueNode
}
