import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { patcher } from './patcher'

export function patcherProvider(
  mutate: Function,
  destroys: Function[],
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  eventTargetProps: WeakMap<EventTarget, Props>,
  removedNodes: WeakMap<Node, boolean>
) {
  return (
    next: Function,
    recursion: Function
  ) => (
    glueNode: GlueNode,
    isSVG: boolean
  ) => patcher(
    mutate,
    destroys,
    lifecycleEvents,
    eventProxy,
    eventTargetProps,
    removedNodes,
    next,
    recursion,
    glueNode,
    isSVG
  )
}
