import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, SLICE } from './consts/attributeNames'
import { Props } from './Props'
import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { isVNode } from './isVNode'
import { remodelProps } from './remodelProps';

export function resolveNode(
  node: VNode,
  parentNode?: VNode | ResolvedVNode
): ResolvedVNode | undefined {
  const rawProps = node[PROPS]

  let context = deepGet(rawProps, CONTEXT)
    || (parentNode && deepGet(parentNode, `${PROPS}.${CONTEXT}`))
    || {}

  let slice = deepGet(rawProps, SLICE)
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
    ...(deepGet(rawProps, EXTRA) || {}),
    ...(parentNode && deepGet(parentNode, `${PROPS}.${EXTRA}`) || {})
  }

  const props = remodelProps(rawProps, context, extra, [])

  const resolved = (node && typeof node.name === "function")
    ? resolveNode(node.name(props as Props, node[CHILDREN]), node)
    : node

  if (isVNode(resolved)) {
    resolved![CHILDREN] = resolved![CHILDREN].reduce((acc, child) => {
      const reslvedChild = resolveNode(child, resolved)
      if (reslvedChild) {
        acc.push(reslvedChild! as ResolvedVNode)
      }
      return acc
    }, [] as ResolvedVNode[])
    return resolved as ResolvedVNode
  }
}
