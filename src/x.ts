import { Component } from './Component'
import { VNode } from './VNode'
import { createVNode } from './createVNode'
import { isVNode } from './isVNode'

export function x(
  name: string | Component | ((name, props, ...rest) => VNode),
  props: any,
  ...rest: any[]
): VNode {
  const children: VNode[] = []

  while (rest.length) {
    const node = rest.pop()
    if (node && Array.isArray(node)) {
      rest = rest.concat(node)
    } else if (node != null && node !== true && node !== false) {
      children.unshift(isVNode(node) && node || createVNode(true, node))
    }
  }

  return createVNode(false, name, props || {}, children)
}
