import { ATTRIBUTES, CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, REMOVING, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV, PREV_ATTRIBUTES } from './consts/glueNodeAttributeNames'
import { ElementExtends } from './ElementExtends'
import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { createElement } from './createElement'
import { deepGet } from './deepGet'
import { getKey } from './getKey'
import { updateElement } from './updateElement'

export function patch(patchStack: Function) {
  return (
    glueNode,
    isSVG,
    eventListener,
    isDestroy
  ): any | null => {
    let patched: any | null = null

    let element

    if (!isSVG && glueNode[NAME] === 'svg') {
      isSVG = true
    }

    if (!isDestroy && glueNode[LIFECYCLE] === DESTROY) {
      isDestroy = true
    }

    const children = glueNode[CHILDREN].reduce((acc, childNode) => {
      const patchedChild = patchStack(childNode, isSVG, eventListener, isDestroy)
      return patchedChild ? acc.concat(patchedChild) : acc
    }, [])

    const lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE]

    switch (lifecycle) {
      case CREATE:
        element = createElement(glueNode, isSVG, eventListener)
        break
      case UPDATE:
        element = updateElement(glueNode, isSVG, eventListener)
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

    children.map(v => v.element).reduceRight((ref, elm) => {
      element.insertBefore(elm, ref)
      return elm
    }, null)

    glueNode[CHILDREN] = children
    glueNode[ELEMENT] = element

    return glueNode
  }
}
