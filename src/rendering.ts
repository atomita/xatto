import { assign } from './assign'
import { UPDATE } from './consts/lifecycleNames'
import { CHILDREN } from './consts/vNodeAttributeNames'
import { noop } from './noop'
import { Resolver } from './resolver'
import { x } from './x'

export function rendering (glueNode, view, extra, renderers) {
  const resolverRecursion: Resolver = (...args) => resolver.apply(null, args)

  const [resolver] = renderers
    .map((v) => v[0])
    .reduce(wrapOnion, [
      (() => []) as Resolver,
      resolverRecursion
    ]) as Resolver[]

  const glueNodeMergerRecursion = (...args) => glueNodeMerger.apply(null, args)

  const [glueNodeMerger] = renderers
    .map((v) => v[1])
    .reduce(wrapOnion, [noop, glueNodeMergerRecursion])

  const patcherRecursion = (...args) => patcher.apply(null, args)

  const [patcher] = renderers
    .map((v) => v[2])
    .reduce(wrapOnion, [noop, patcherRecursion])

  const [finallyer] = renderers.map((v) => v[3]).reduce(wrapOnion, [noop, noop])

  const vNodes = resolver(x(view, { xa: { extra } }, []))

  const container = assign({}, glueNode)
  container[CHILDREN] = vNodes

  const node = glueNodeMerger(UPDATE, container, glueNode)

  glueNode = patcher(node, 'svg' === node.name)

  finallyer()

  return glueNode
}

function wrapOnion ([next, recursion], stack) {
  return [stack ? stack(next, recursion) : next, recursion]
}
