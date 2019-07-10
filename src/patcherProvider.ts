import { GlueNode } from './GlueNode'
import { patcher } from './patcher'
import { Props } from './Props'

export function patcherProvider (
  mutate: Function,
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  eventTargetProps: WeakMap<EventTarget, Props>,
  removedNodes: WeakMap<Node, boolean>
) {
  return (next: Function, recursion: Function) => (
    glueNode: GlueNode,
    isSVG: boolean
  ) =>
    patcher(
      mutate,
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
