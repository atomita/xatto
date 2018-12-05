import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { patcher } from './patcher'

export function patcherProvider(
  mutate: Function,
  destroys: Function[],
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>
) {
  return (
    next: Function,
    recursion: Function
  ) => (
    glueNode: GlueNode,
    isSVG: boolean,
    isDestroy: boolean
  ) => patcher(
    mutate,
    destroys,
    lifecycleEvents,
    eventProxy,
    elementProps,
    next,
    recursion,
    glueNode,
    isSVG,
    isDestroy
  )
}
