import { CREATE, DESTROY, REMOVE, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV_PROPS } from './consts/glueNodeAttributeNames'
import { GlueNode } from './GlueNode'
import { PatchStack } from './PatchStack'
import { PROPS } from './consts/vNodeAttributeNames'
import { Props } from './Props'
import { deepGet } from './deepGet'
import { lifeCycleEventPath } from './lifeCycleEventPath'
import { partial } from './partial'

function pickupLifecycleEvents(
  lifecycleEvents: Function[],
  mutate: Function,
  patchStack: PatchStack,
  glueNode: GlueNode,
  isSVG: boolean,
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>,
  isDestroy: boolean
) {
  const lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE]

  let lifecycleEvent: Function | undefined

  switch (lifecycle) {
    case CREATE:
      lifecycleEvent = deepGet(glueNode, lifeCycleEventPath(CREATE))
      break
    case UPDATE:
      lifecycleEvent = deepGet(glueNode, lifeCycleEventPath(UPDATE))
      break
    case REMOVE:
      const onremove: Function = deepGet(glueNode, lifeCycleEventPath(REMOVE))
      const done = () => {
        glueNode[LIFECYCLE] = DESTROY
        Promise.resolve().then(mutate as any)
      }
      lifecycleEvent = (element, attrs, prevAttrs) => {
        onremove(element, done, attrs, prevAttrs)
      }
      break
    case DESTROY:
      lifecycleEvent = deepGet(glueNode, lifeCycleEventPath(DESTROY))
      break
  }

  if (lifecycleEvent) {
    lifecycleEvents.push(() => {
      lifecycleEvent!(glueNode[ELEMENT], glueNode[PROPS], deepGet(glueNode, PREV_PROPS))
    })
  }

  return patchStack(glueNode, isSVG, eventProxy, elementProps, isDestroy)
}

export function pickLifecycleEvents(mutate: Function) {
  const lifecycleEvents: Function[] = []

  return [
    (stack: Function) => partial(pickupLifecycleEvents, [lifecycleEvents, mutate, stack]),

    // finally
    () => lifecycleEvents.reduce((_, lifecycleEvent) => lifecycleEvent(), 0)
  ]
}
