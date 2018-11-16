import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, FILL, SLICE } from './consts/attributeNames'
import { Component } from './Component'
import { Props } from './Props'
import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
import { assign } from './assign'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { isVNode } from './isVNode'
import { remodelProps } from './remodelProps'
import { x } from './x'

function resolveChildren(
  children: VNode[],
  parentNode?: VNode | ResolvedVNode
) {
  return children.reduce((childs, child) => {
    childs.push.apply(childs, resolveNode(child, parentNode))
    return childs
  }, [] as ResolvedVNode[])
}

export function resolveNode(
  node?: VNode,
  parentNode?: VNode | ResolvedVNode
): ResolvedVNode[] {
  if (!node) {
    return []
  }

  if (x === node.name) { // Fragment
    return resolveChildren(node[CHILDREN], parentNode)
  }

  const rawProps = node[PROPS]

  let context = deepGet(rawProps, CONTEXT)
    || (parentNode && deepGet(parentNode, `${PROPS}.${CONTEXT}`))
    || {}

  let slice = deepGet(rawProps, SLICE) as string

  if (slice) {
    let sliced = deepGet(context, slice)
    if (!sliced) {
      const fill = deepGet(rawProps, FILL) || {}
      sliced = assign({}, fill)
      deepSet(context, slice, sliced)
    }
    context = sliced
  }

  const extra = assign(
    assign({}, deepGet(rawProps, EXTRA) || {}),
    parentNode && deepGet(parentNode, `${PROPS}.${EXTRA}`) || {}
  )

  const props = remodelProps(rawProps, context, extra)

  const resolveds = (typeof node.name === "function"
    ? resolveNode((node!.name as Component)(props as Props, node[CHILDREN]), node)
    : [node]
  ).reduce((acc, resolved) => {
    if (isVNode(resolved)) {
      resolved![CHILDREN] = resolveChildren(resolved![CHILDREN], resolved)
      acc.push(resolved as ResolvedVNode)
    }
    return acc
  }, [] as ResolvedVNode[])

  return resolveds
}
