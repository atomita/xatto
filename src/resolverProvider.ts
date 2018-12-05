import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
import { resolver } from './resolver'

export function resolverProvider(
  getContext,
  setContext
) {
  return (
    next: Function,
    recursion: Function
  ) => (
    node?: VNode,
    parentNode?: VNode | ResolvedVNode
  ) => resolver(
    getContext,
    setContext,
    next,
    recursion,
    node,
    parentNode
  )
}
