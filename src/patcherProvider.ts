import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { patcher } from './patcher'

export function patcherProvider(
  mutate: Function,
  destroys: Function[],
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>,
  elementRemoveds: WeakMap<Element, boolean>
) {
  return (
    next: Function,
    recursion: Function
  ) => (
    glueNode: GlueNode,
    isSVG: boolean,
    captureLifecycle: string
  ) => patcher(
    mutate,
    destroys,
    lifecycleEvents,
    eventProxy,
    elementProps,
    elementRemoveds,
    next,
    recursion,
    glueNode,
    isSVG,
    captureLifecycle
  )
}
