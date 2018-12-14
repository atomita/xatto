import { ResolvedVNode } from './ResolvedVNode'
import { resolver } from './resolver'
import { VNode } from './VNode'

export function resolverProvider (getContext, setContext) {
  return (next: Function, recursion: Function) => (
    node?: VNode,
    parentNode?: VNode | ResolvedVNode
  ) => resolver(getContext, setContext, next, recursion, node, parentNode)
}
