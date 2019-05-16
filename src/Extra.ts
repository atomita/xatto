import { VNode } from './VNode'
import { x } from './x'

export function Extra (props, children: VNode[]) {
  return x(ExtraInner, { xa: { extra: props }, children })
}

function ExtraInner ({ children }: { children: VNode[] }) {
  return x(x, {}, children)
}
