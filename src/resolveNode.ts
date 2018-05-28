import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA } from './consts/attributeNames'

export function resolveNode(node, parentNode) {
  const attributes = node && node[ATTRIBUTES]

  if (attributes) {
    const context = attributes[CONTEXT]
      || (parentNode && parentNode[ATTRIBUTES] && parentNode[ATTRIBUTES][CONTEXT])
      || {}
    const extra = {
      ...(attributes[EXTRA] || {}),
      ...(parentNode && parentNode[ATTRIBUTES] && parentNode[ATTRIBUTES][EXTRA] || {})
    }

    attributes[CONTEXT] = context
    attributes[EXTRA] = extra
  }

  return (node && typeof node.name === "function")
    ? resolveNode(node.name(node[ATTRIBUTES], node[CHILDREN]), node)
    : node != null
      ? node
      : ""
}
