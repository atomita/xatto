import { ResolvedVNode } from './ResolvedVNode'
import { resolver, Resolver } from './resolver'
import { VNode } from './VNode'

export function resolverProvider (getContext, setContext) {
  return (next: Resolver, recursion: Resolver) => (
    node: VNode,
    parentNode?: VNode | ResolvedVNode
  ) => resolver(getContext, setContext, next, recursion, node, parentNode)
}
