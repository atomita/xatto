import { CHILDREN, PROPS } from './consts/vNodeAttributeNames';
import { mergeGlueNode } from './mergeGlueNode';
import { remodelProps } from './remodelProps';
import { x } from './x'
import { assign } from './assign';

export function rendering(
  glueNode,
  view,
  renderers
) {
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

  const vNodes = resolver(x(view, {}, []))

  const container = assign({}, glueNode)
  container[CHILDREN] = vNodes

  const node = mergeGlueNode(container, glueNode)

  glueNode = patcher(
    node,
    'svg' === node.name,
    ''
  )

  finallyer()

  return glueNode
}

function wrapOnion([next, recursion], stack) {
  return [stack ? stack(next, recursion) : next, recursion]
}

function noop() { }
