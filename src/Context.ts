import { VNode } from './VNode'
import { x } from './x'

export function Context (
  { slice, fill }: { slice?: string; fill?: any },
  children: VNode[]
) {
  return x(ContextInner, { xa: { slice, fill }, children })
}

function ContextInner ({ children }: { children: VNode[] }) {
  return x(x, {}, children)
}
