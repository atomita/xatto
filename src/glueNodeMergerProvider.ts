import { GlueNode } from "./GlueNode";
import { ResolvedVNode } from "./ResolvedVNode";
import { glueNodeMerger } from "./glueNodeMerger";

export function glueNodeMergerProvider() {
  return (
    next: Function,
    recursion: Function
  ) => (
    vNode?: ResolvedVNode,
    glueNode?: GlueNode
  ) => glueNodeMerger(
    next,
    recursion,
    vNode,
    glueNode
  )
}
