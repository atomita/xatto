import { VDOM } from './VDOM'
import { createVDOM } from './createVDOM'
import { isVDOM } from './isVDOM'

export function x(name, attributes, ...rest): VDOM {
  const children: VDOM[] = []

  while (rest.length) {
    const node = rest.pop()
    if (node && Array.isArray(node)) {
      rest = rest.concat(node)
    } else if (node != null && node !== true && node !== false) {
      children.unshift(isVDOM(node) && node || createVDOM(true, node))
    }
  }

  return createVDOM(false, name, attributes || {}, children)
}
