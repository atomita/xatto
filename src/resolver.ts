import { assign } from './assign'
import { Component } from './Component'
import { EXTRA, FILL, PATH, SLICE } from './consts/attributeNames'
import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { deepGet } from './deepGet'
import { isVNode } from './isVNode'
import { Props } from './Props'
import { remodelProps } from './remodelProps'
import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
import { x } from './x'

export type Resolver = (
  node?: VNode,
  parent?: VNode | ResolvedVNode
) => ResolvedVNode[]

function resolveChildren (
  _: Resolver,
  recursion: Resolver,
  children: VNode[],
  parentNode?: VNode | ResolvedVNode
) {
  return children.reduce(
    (childs, child) => {
      childs.push.apply(childs, recursion(child, parentNode))
      return childs
    },
    [] as ResolvedVNode[]
  )
}

export function resolver (
  getContext,
  setContext,
  next: Resolver,
  recursion: Resolver,
  node?: VNode,
  parentNode?: VNode | ResolvedVNode
): ResolvedVNode[] {
  if (!node) {
    return []
  }

  if (x === node.name) {
    // Fragment
    return resolveChildren(next, recursion, node[CHILDREN], parentNode)
  }

  const rawProps = node[PROPS]

  const parentProps = (parentNode && parentNode[PROPS]) || {}

  let path = deepGet(rawProps, PATH) as string

  if (!path) {
    const parentPath = deepGet(parentProps, PATH) || ''

    let slice = deepGet(rawProps, SLICE)
    if (slice != null) {
      slice = `${slice}`
    }

    path =
      parentPath && slice
        ? `${parentPath}.${slice}`
        : ((slice || parentPath) as string)
  }

  let sliced = getContext(path, false)
  if (!sliced) {
    sliced = {}
    setContext(sliced, path)
  }

  const fill: any = deepGet(rawProps, FILL)

  if (fill) {
    for (const key in fill) {
      if (fill.hasOwnProperty(key) && !(key in sliced)) {
        sliced[key] = fill[key]
      }
    }
  }

  const context = sliced

  const extra = assign(
    assign({}, deepGet(rawProps, EXTRA) || {}),
    (parentNode && deepGet(parentNode, `${PROPS}.${EXTRA}`)) || {}
  )

  const props = remodelProps(rawProps, context, extra, path)

  let nodes
  if (typeof node.name === 'function') {
    const proceeded = (node!.name as Component)(props as Props, node[CHILDREN])
    nodes = isVNode(proceeded) ? recursion(proceeded, node) : []
  } else {
    nodes = [node]
  }

  const resolveds = nodes.reduce(
    (acc, resolved) => {
      if (isVNode(resolved)) {
        resolved![CHILDREN] = resolveChildren(
          next,
          recursion,
          resolved![CHILDREN],
          resolved
        )
        acc.push(resolved as ResolvedVNode)
      }
      return acc
    },
    [] as ResolvedVNode[]
  )

  return resolveds
}
