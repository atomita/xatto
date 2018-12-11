import { GlueNode } from "./GlueNode";
import { ResolvedVNode } from "./ResolvedVNode";
import { glueNodeMerger } from "./glueNodeMerger";

export function glueNodeMergerProvider(
  removedNodes: WeakMap<Node, boolean>
) {
  return (
    next: Function,
    recursion: Function
  ) => (
    captureLifecycle: string,
    vNode?: ResolvedVNode,
    glueNode?: GlueNode
  ) => glueNodeMerger(
    removedNodes,
    next,
    recursion,
    captureLifecycle,
    vNode,
    glueNode
  )
}
