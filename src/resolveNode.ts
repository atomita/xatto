import { ATTRIBUTES, CHILDREN, XA_CONTEXT, XA_EXTRA } from './consts'

export function resolveNode(node, parentNode) {
  if ('string' === typeof node) {
    return node
  }

  const context = node[ATTRIBUTES][XA_CONTEXT]
    || parentNode[ATTRIBUTES][XA_CONTEXT]
    || {}
  const extra = {
    ...(node[ATTRIBUTES][XA_EXTRA] || {}),
    ...(parentNode[ATTRIBUTES][XA_EXTRA] || {})
  }

  node[ATTRIBUTES][XA_CONTEXT] = context
  node[ATTRIBUTES][XA_EXTRA] = extra

  return typeof node.name === "function"
    ? resolveNode(node.name(node[ATTRIBUTES], node[CHILDREN]), node)
    : node != null
      ? node
      : ""
}
