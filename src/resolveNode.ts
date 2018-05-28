import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA } from './consts/attributeNames'

export function resolveNode(node, parentNode) {
  if ('string' === typeof node) {
    return node
  }

  const context = node[ATTRIBUTES][CONTEXT]
    || parentNode[ATTRIBUTES][CONTEXT]
    || {}
  const extra = {
    ...(node[ATTRIBUTES][EXTRA] || {}),
    ...(parentNode[ATTRIBUTES][EXTRA] || {})
  }

  node[ATTRIBUTES][CONTEXT] = context
  node[ATTRIBUTES][EXTRA] = extra

  return typeof node.name === "function"
    ? resolveNode(node.name(node[ATTRIBUTES], node[CHILDREN]), node)
    : node != null
      ? node
      : ""
}
