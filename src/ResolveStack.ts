import { VNode } from './VNode'
import { ResolvedVNode } from './ResolvedVNode'

export interface ResolveStack {
  (
    rootContext: any,
    node?: VNode,
    parentNode?: VNode | ResolvedVNode
  ): ResolvedVNode[]
}
