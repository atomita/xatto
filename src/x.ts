import { VNode } from './VNode'
import { createVNode } from './createVNode'
import { isVNode } from './isVNode'

export function x(name, attributes, ...rest): VNode {
  const children: VNode[] = []

  while (rest.length) {
    const node = rest.pop()
    if (node && Array.isArray(node)) {
      rest = rest.concat(node)
    } else if (node != null && node !== true && node !== false) {
      children.unshift(isVNode(node) && node || createVNode(true, node))
    }
  }

  return createVNode(false, name, attributes || {}, children)
}
