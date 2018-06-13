import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA, SLICE, XA_CONTEXT, XA_EXTRA, XA_SLICE } from './consts/attributeNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'

export function resolveNode(node, parentNode) {
  const attributes = node && node[ATTRIBUTES]

  if (attributes) {
    let context = deepGet(attributes, CONTEXT)
      || attributes[XA_CONTEXT]
      || (parentNode && (
        deepGet(parentNode, `${ATTRIBUTES}.${CONTEXT}`)
        || deepGet(parentNode, `${ATTRIBUTES}.${XA_CONTEXT}`)))
      || {} // todo mixed to be deprecated

    let slice = deepGet(attributes, SLICE) || attributes[XA_SLICE]
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
      ...(deepGet(attributes, EXTRA) || attributes[XA_EXTRA] || {}),
      ...(parentNode && (
        deepGet(parentNode, `${ATTRIBUTES}.${EXTRA}`)
        || deepGet(parentNode, `${ATTRIBUTES}.${XA_EXTRA}`)) || {})
    }

    deepSet(attributes, CONTEXT, context)
    deepSet(attributes, EXTRA, extra)
    attributes[XA_CONTEXT] = context // todo to be deprecated
    attributes[XA_EXTRA] = extra // todo to be deprecated
  }

  return (node && typeof node.name === "function")
    ? resolveNode(node.name(node[ATTRIBUTES], node[CHILDREN]), node)
    : node != null
      ? node
      : ""
}
