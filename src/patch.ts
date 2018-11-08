import { CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, REMOVING, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV } from './consts/glueNodeAttributeNames'
import { GlueNode } from './GlueNode'
import { PatchStack } from './PatchStack'
import { Props } from './Props'
import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { createElement } from './createElement'
import { deepGet } from './deepGet'
import { partial } from './partial'
import { updateElement } from './updateElement'

function patcher(
  patchStack: PatchStack,
  glueNode: GlueNode,
  isSVG: boolean,
  eventProxy: (e: Event) => void,
  elementProps: WeakMap<Element, Props>,
  isDestroy: boolean
): GlueNode | null {

  let patched: any | null = null

  let element

  if (!isSVG && glueNode[NAME] === 'svg') {
    isSVG = true
  }

  if (!isDestroy && glueNode[LIFECYCLE] === DESTROY) {
    isDestroy = true
  }

  const children = glueNode[CHILDREN].reduce((acc, childNode) => {
    const patchedChild = patchStack(childNode, isSVG, eventProxy, elementProps, isDestroy)
    return patchedChild ? acc.concat(patchedChild) : acc
  }, [] as GlueNode[])

  const lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE]

  switch (lifecycle) {
    case CREATE:
      element = createElement(glueNode, isSVG, eventProxy, elementProps)
      break
    case UPDATE:
      element = updateElement(glueNode, isSVG, eventProxy, elementProps)
      break
    case DESTROY:
      if (glueNode[LIFECYCLE] === DESTROY) {
        element = glueNode[ELEMENT]
        element.parentElement.removeChild(element)
      }
      return null
    case REMOVE:
      glueNode[LIFECYCLE] = REMOVING
    default:
      element = glueNode[ELEMENT]
  }

  children.map(v => v.element!).reduceRight((ref, elm) => {
    element.insertBefore(elm, ref)
    return elm
  }, null as any)

  glueNode[CHILDREN] = children
  glueNode[ELEMENT] = element

  return glueNode
}

export function patch(/* mutate: Function */) {
  return [
    // patch stack
    (patchStack: Function) => partial(patcher, [patchStack])

    // There is no post-treatment
  ]
}
