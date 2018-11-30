import { CHILDREN, PROPS } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, FILL, PATH, SLICE } from './consts/attributeNames'
import { Component } from './Component'
import { Props } from './Props'
import { ResolveStack } from './ResolveStack'
import { ResolvedVNode } from './ResolvedVNode'
import { VNode } from './VNode'
import { assign } from './assign'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { isVNode } from './isVNode'
import { partial } from './partial'
import { remodelProps } from './remodelProps'
import { x } from './x'

function resolveChildren(
  resolveStack: ResolveStack,
  rootContext: any,
  children: VNode[],
  parentNode?: VNode | ResolvedVNode
) {
  return children.reduce((childs, child) => {
    childs.push.apply(childs, resolveStack(rootContext, child, parentNode))
    return childs
  }, [] as ResolvedVNode[])
}

function resolver(
  resolveStack: ResolveStack,
  rootContext: any,
  node?: VNode,
  parentNode?: VNode | ResolvedVNode
): ResolvedVNode[] {
  if (!node) {
    return []
  }

  if (x === node.name) { // Fragment
    return resolveChildren(resolveStack, rootContext, node[CHILDREN], parentNode)
  }

  const rawProps = node[PROPS]

  const parentProps = parentNode && parentNode[PROPS] || {}

  let path = deepGet(rawProps, PATH) as string

  if (!path) {
    const parentPath = deepGet(parentProps, PATH) || ''

    const slice = deepGet(rawProps, SLICE) as string

    path = (parentPath && slice)
      ? `${parentPath}.${slice}`
      : (slice || parentPath) as string
  }

  let sliced = path ? deepGet(rootContext, path) : rootContext

  if (!sliced) {
    const fill = deepGet(rawProps, FILL) || {}

    sliced = assign({}, fill)

    deepSet(rootContext, path, sliced)
  }

  const context = sliced

  const extra = assign(
    assign({}, deepGet(rawProps, EXTRA) || {}),
    parentNode && deepGet(parentNode, `${PROPS}.${EXTRA}`) || {}
  )

  const props = remodelProps(rawProps, context, extra, path)

  const resolveds = (typeof node.name === "function"
    ? resolveStack(rootContext, (node!.name as Component)(props as Props, node[CHILDREN]), node)
    : [node]
  ).reduce((acc, resolved) => {
    if (isVNode(resolved)) {
      resolved![CHILDREN] = resolveChildren(resolveStack, rootContext, resolved![CHILDREN], resolved)
      acc.push(resolved as ResolvedVNode)
    }
    return acc
  }, [] as ResolvedVNode[])

  return resolveds
}

export function resolveNode(
  resolveStack: Function
) {
  return partial(resolver, [resolveStack])
}
