import { CREATE, DESTROY, REMOVE, UPDATE } from './consts/lifecycleNames'
import { ATTRIBUTES } from './consts/vNodeAttributeNames'
import { ELEMENT, LIFECYCLE, PREV_ATTRIBUTES } from './consts/glueNodeAttributeNames'
import { deepGet } from './deepGet'
import { lifeCycleEventPath } from './lifeCycleEventPath'

export function pickLifecycleEvents(lifecycleEvents: any[], mutate: Function) {
  return (stack: Function) => (
    glueNode,
    isSVG,
    eventListener,
    isDestroy = false
  ) => {
    const lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE]

    const newGlueNode = stack(glueNode, isSVG, eventListener, isDestroy)

    let lifecycleEvent: Function | undefined

    switch (lifecycle) {
      case CREATE:
        lifecycleEvent = deepGet(newGlueNode, lifeCycleEventPath(CREATE))
        break
      case UPDATE:
        lifecycleEvent = deepGet(newGlueNode, lifeCycleEventPath(UPDATE))
        break
      case REMOVE:
        const onremove: Function = deepGet(newGlueNode, lifeCycleEventPath(REMOVE))
        const done = () => {
          newGlueNode[LIFECYCLE] = DESTROY
          Promise.resolve().then(mutate as any)
        }
        lifecycleEvent = (element, attrs, prevAttrs) => {
          onremove(element, done, attrs, prevAttrs)
        }
        break
      case DESTROY:
        lifecycleEvent = deepGet(newGlueNode, lifeCycleEventPath(DESTROY))
        break
    }

    if (lifecycleEvent) {
      lifecycleEvents.push(() => {
        lifecycleEvent!(newGlueNode[ELEMENT], newGlueNode[ATTRIBUTES], deepGet(newGlueNode, PREV_ATTRIBUTES))
      })
    }

    return newGlueNode
  }
}
