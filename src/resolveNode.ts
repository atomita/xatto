import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, SLICE } from './consts/attributeNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { isVNode } from './isVNode'

export function resolveNode(node, parentNode) {
  const props = node && node[PROPS]

  if (props) {
    let context = deepGet(props, CONTEXT)
      || (parentNode && deepGet(parentNode, `${PROPS}.${CONTEXT}`))
      || {}

    let slice = deepGet(props, SLICE)
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
      ...(deepGet(props, EXTRA) || {}),
      ...(parentNode && deepGet(parentNode, `${PROPS}.${EXTRA}`) || {})
    }

    deepSet(props, CONTEXT, context)
    deepSet(props, EXTRA, extra)
    deepSet(props, SLICE, [])
  }

  const resolved = (node && typeof node.name === "function")
    ? resolveNode(node.name(node[PROPS], node[CHILDREN]), node)
    : node

  if (isVNode(resolved)) {
    resolved[CHILDREN] = resolved[CHILDREN].reduce((acc, child) => {
      const reslvedChild = resolveNode(child, resolved)
      if (reslvedChild) {
        acc.push(reslvedChild)
      }
      return acc
    }, [])
    return resolved
  }

  return null
}
