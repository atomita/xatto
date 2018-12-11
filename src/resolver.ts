import { assign } from './assign'
import { Component } from './Component'
import { CONTEXT, EXTRA, FILL, PATH, SLICE } from './consts/attributeNames'
import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { isVNode } from './isVNode'
import { Props } from './Props'
import { remodelProps } from './remodelProps'
import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
import { x } from './x'

function resolveChildren (
  next: Function,
  recursion: Function,
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
  next: Function,
  recursion: Function,
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

    const slice = deepGet(rawProps, SLICE) as string

    path =
      parentPath && slice
        ? `${parentPath}.${slice}`
        : ((slice || parentPath) as string)
  }

  let sliced = getContext(path)

  if (!sliced) {
    const fill = deepGet(rawProps, FILL) || {}

    sliced = assign({}, fill)

    setContext(sliced, path)
  }

  const context = sliced

  const extra = assign(
    assign({}, deepGet(rawProps, EXTRA) || {}),
    (parentNode && deepGet(parentNode, `${PROPS}.${EXTRA}`)) || {}
  )

  const props = remodelProps(rawProps, context, extra, path)

  const resolveds = (typeof node.name === 'function'
    ? recursion((node!.name as Component)(props as Props, node[CHILDREN]), node)
    : [node]
  ).reduce(
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
