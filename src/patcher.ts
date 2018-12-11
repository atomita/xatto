import { CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, REMOVING, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV } from './consts/glueNodeAttributeNames'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { assign } from './assign';
import { createElement } from './createElement'
import { deepGet } from './deepGet'
import { fireLifeCycleEventProvider } from './fireLifeCycleEventProvider';
import { updateElement } from './updateElement'

const shouldBeCaptureLifecycles = {}
shouldBeCaptureLifecycles[REMOVE] = 1
shouldBeCaptureLifecycles[REMOVING] = 2
shouldBeCaptureLifecycles[DESTROY] = 3

export function patcher(
  mutate: Function,
  destroys: Function[],
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>,
  elementRemoveds: WeakMap<Element, boolean>,
  next: Function,
  recursion: Function,
  glueNode: GlueNode,
  isSVG: boolean,
  captureLifecycle: string
): GlueNode | null {

  const newGlueNode = assign({}, glueNode)

  let element: Element | Node = glueNode[ELEMENT]!

  if (!isSVG && glueNode[NAME] === 'svg') {
    isSVG = true
  }

  let rawLifecycle = glueNode[LIFECYCLE]

  if (
    rawLifecycle === REMOVING
    && element instanceof Element
    && elementRemoveds.has(element)
  ) {
    rawLifecycle = DESTROY
  }

  const shouldBeCaptureLifecycle = shouldBeCaptureLifecycles[rawLifecycle]
  const shouldBeCaptureLifecycleByCaptured = shouldBeCaptureLifecycles[captureLifecycle]

  const lifecycle =
    shouldBeCaptureLifecycleByCaptured
    && (!shouldBeCaptureLifecycle || shouldBeCaptureLifecycle < shouldBeCaptureLifecycleByCaptured)
    && captureLifecycle
    || rawLifecycle

  newGlueNode[LIFECYCLE] = lifecycle

  let lifecycleEvent
  let detail: any = null

  switch (lifecycle) {
    case CREATE:
      lifecycleEvent = true
      element = createElement(glueNode, isSVG, eventProxy, elementProps)
      break
    case UPDATE:
      [element, lifecycleEvent] = updateElement(glueNode, isSVG, eventProxy, elementProps)
      break
    case DESTROY:
      lifecycleEvent = true
      if (rawLifecycle == DESTROY) {
        destroys.push(() => {
          const parent = element.parentElement || element.parentNode
          parent && parent.removeChild(element)
        })
      }
      break
    case REMOVE:
      lifecycleEvent = true
      newGlueNode[LIFECYCLE] = REMOVING
      detail = {
        done: () => {
          elementRemoveds.set(element as Element, true)
          Promise.resolve({}).then(mutate as any)
        }
      }
  }

  if (lifecycleEvent && element instanceof Element) {
    lifecycleEvents.push(fireLifeCycleEventProvider(element, lifecycle.toLowerCase(), { detail }))
  }

  const children = glueNode[CHILDREN].reduce((acc, childNode) => {
    const patchedChild = recursion(childNode, isSVG, lifecycle)
    return patchedChild ? acc.concat(patchedChild) : acc
  }, [] as GlueNode[])

  if (lifecycle === DESTROY) {
    return null
  }

  children.map(v => v.element!).reduceRight((ref, elm) => {
    element.insertBefore(elm, ref)
    return elm
  }, null as any)

  newGlueNode[CHILDREN] = children
  newGlueNode[ELEMENT] = element

  return newGlueNode
}
