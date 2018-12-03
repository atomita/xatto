import { CHILDREN, PROPS } from './consts/vNodeAttributeNames';
import { mergeGlueNode } from './mergeGlueNode';
import { patch } from './patch';
import { pickLifecycleEvents } from './pickLifecycleEvents';
import { remodelProps } from './remodelProps';
import { resolveNode } from './resolveNode';
import { x } from './x'

export function rendering(
  glueNode,
  view,
  rootContext,
  mutate,
  eventProxy,
  elementProps
) {
  const rootProps = remodelProps(glueNode[PROPS])

  const resolveStack = ([
    resolveNode
  ] as Function[]).reduce(
    (acc, stack) => stack(acc),
    (...args) => resolveStack.apply(null, args))

  const root = resolveStack(rootContext, x(view, rootProps, glueNode[CHILDREN]))[0]

  const node = mergeGlueNode(root, glueNode)

  const patchStacks: Function[][/* 0: patch stack, 1: finally */] = [
    patch(/* mutate */),
    pickLifecycleEvents(mutate)
  ]

  const patchStack = patchStacks.map(v => v[0]).reduce(
    (acc, stack) => stack(acc),
    (...args) => patchStack.apply(null, args))

  glueNode = patchStack(
    node,
    'svg' === node.name,
    eventProxy,
    elementProps,
    false
  )

  patchStacks.map(v => v[1]).reduce(
    (acc, end) => end ? end(acc) : acc,
    () => { })()

  return glueNode
}
