import { CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, REMOVING, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV } from './consts/glueNodeAttributeNames'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { createElement } from './createElement'
import { deepGet } from './deepGet'
import { partial } from './partial'
import { provideFireLifeCycleEvent } from './provideFireLifeCycleEvent';
import { updateElement } from './updateElement'

export function patch(
  mutate: Function,
  destroys: Function[],
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>,
  next: Function,
  recursion: Function,
  glueNode: GlueNode,
  isSVG: boolean,
  isDestroy: boolean
): GlueNode | null {

  let patched: any | null = null

  let element: Element | Node = glueNode[ELEMENT]!

  if (!isSVG && glueNode[NAME] === 'svg') {
    isSVG = true
  }

  if (!isDestroy && glueNode[LIFECYCLE] === DESTROY) {
    isDestroy = true
  }

  const lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE]

  let lifecycleEvent
  let detail: any = null

  switch (lifecycle) {
    case CREATE:
      element = createElement(glueNode, isSVG, eventProxy, elementProps)
      break
    case UPDATE:
      [element, lifecycleEvent] = updateElement(glueNode, isSVG, eventProxy, elementProps)
      break
    case DESTROY:
      if (glueNode[LIFECYCLE] === DESTROY) {
        destroys.push(() => element.parentElement!.removeChild(element))
      }
      break
    case REMOVE:
      glueNode[LIFECYCLE] = REMOVING
      detail = {
        done: () => {
          glueNode[LIFECYCLE] = DESTROY
          Promise.resolve({}).then(mutate as any)
        }
      }
  }

  switch (lifecycle) {
    case CREATE:
    case DESTROY:
    case REMOVE:
      lifecycleEvent = true
  }
  if (lifecycleEvent && element instanceof Element) {
    lifecycleEvents.push(provideFireLifeCycleEvent(element, lifecycle.toLowerCase(), { detail }))
  }

  const children = glueNode[CHILDREN].reduce((acc, childNode) => {
    const patchedChild = recursion(childNode, isSVG, isDestroy)
    return patchedChild ? acc.concat(patchedChild) : acc
  }, [] as GlueNode[])

  if (lifecycle === DESTROY) {
    return null
  }

  children.map(v => v.element!).reduceRight((ref, elm) => {
    element.insertBefore(elm, ref)
    return elm
  }, null as any)

  glueNode[CHILDREN] = children
  glueNode[ELEMENT] = element

  return glueNode
}
