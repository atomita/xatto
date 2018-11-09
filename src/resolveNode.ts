import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, SLICE } from './consts/attributeNames'
import { Component } from './Component'
import { Props } from './Props'
import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
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
