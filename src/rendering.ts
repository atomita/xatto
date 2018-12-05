import { CHILDREN, PROPS } from './consts/vNodeAttributeNames';
import { mergeGlueNode } from './mergeGlueNode';
import { remodelProps } from './remodelProps';
import { x } from './x'

export function rendering(
  glueNode,
  view,
  renderers
) {
  const rootProps = remodelProps(glueNode[PROPS])

  const resolverRecursion = (...args) => resolver.apply(null, args)

  const [resolver] = renderers.map(v => v[0]).reduce(
    wrapOnion,
    [noop, resolverRecursion])

  const patcherRecursion = (...args) => patcher.apply(null, args)

  const [patcher] = renderers.map(v => v[1]).reduce(
    wrapOnion,
    [noop, patcherRecursion])

  const [finallyer] = renderers.map(v => v[2]).reduce(
    wrapOnion,
    [noop, noop])

  const vNode = resolver(x(view, rootProps, []))[0]

  const node = mergeGlueNode(vNode, glueNode)

  glueNode = patcher(
    node,
    'svg' === node.name,
    false
  )

  finallyer()

  return glueNode
}

function wrapOnion([next, recursion], stack) {
  return [stack ? stack(next, recursion) : next, recursion]
}

function noop() { }
