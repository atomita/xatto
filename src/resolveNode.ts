import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA, SLICE } from './consts/attributeNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'

export function resolveNode(node, parentNode) {
  const attributes = node && node[ATTRIBUTES]

  if (attributes) {
    let context = attributes[CONTEXT]
      || (parentNode && parentNode[ATTRIBUTES] && parentNode[ATTRIBUTES][CONTEXT])
      || {}

    let slice = attributes[SLICE]
    let sliced: any

    if ('object' !== typeof slice) {
      slice = [slice]
    }
    const path = slice[0]

    if (path) {
      sliced = deepGet(context, path)
      if (!sliced) {
        const defaultValue = slice[1] || {}
        sliced = { ...defaultValue }
        deepSet(context, path, sliced)
      }
      context = sliced
    }

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
