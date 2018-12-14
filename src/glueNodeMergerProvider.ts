import { GlueNode } from './GlueNode'
import { glueNodeMerger } from './glueNodeMerger'
import { ResolvedVNode } from './ResolvedVNode'

export function glueNodeMergerProvider (removedNodes: WeakMap<Node, boolean>) {
  return (next: Function, recursion: Function) => (
    captureLifecycle: string,
    vNode?: ResolvedVNode,
    glueNode?: GlueNode
  ) =>
    glueNodeMerger(
      removedNodes,
      next,
      recursion,
      captureLifecycle,
      vNode,
      glueNode
    )
}
