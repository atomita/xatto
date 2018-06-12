import { ElementExtends } from './ElementExtends'
import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames'
import { RECYCLE, TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { createElement } from './createElement'
import { getKey } from './getKey'
import { removeElement } from './removeElement'
import { resolveNode } from './resolveNode'
import { updateElement } from './updateElement'

export function patch(
  parent: Element,
  element: Element & ElementExtends,
  oldNode,
  node,
  lifecycle: Array<() => void>,
  isSVG = false,
  eventListener
) {
  if (node === oldNode) {
    // noop
  } else if (oldNode == null || oldNode.name !== node.name) {
    const newElement = createElement(node, lifecycle, isSVG, eventListener)
    parent.insertBefore(newElement, element)

    if (oldNode != null) {
      removeElement(parent, element, oldNode)
    }

    element = newElement
  } else if (oldNode.name === TEXT_NODE) {
    element.nodeValue = node[ATTRIBUTES][TEXT]
  } else {
    updateElement(
      element,
      oldNode[ATTRIBUTES],
      node[ATTRIBUTES],
      lifecycle,
      (isSVG = isSVG || node.name === "svg"),
      eventListener
    )

    const oldKeyed = {}
    const newKeyed = {}
    const oldElements: Array<Element & ElementExtends> = []
    const oldChildren = oldNode[CHILDREN]
    const children = node[CHILDREN]

    for (let i = 0; i < oldChildren.length; i++) {
      oldElements[i] = element.childNodes[i] as Element & ElementExtends

      const oldKey = getKey(oldChildren[i])
      if (oldKey != null) {
        oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
      }
    }

    let i = 0
    let k = 0

    while (k < children.length) {
      const oldKey = getKey(oldChildren[i])
      const newKey = getKey(children[k] = resolveNode(children[k], node))

      if (newKeyed[oldKey]) {
        i++
        continue
      }

      if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
        if (oldKey == null) {
          removeElement(element, oldElements[i], oldChildren[i])
        }
        i++
        continue
      }

      const recycle = (children[k][ATTRIBUTES] || {})[RECYCLE]

      if (newKey == null || true === recycle) {
        if (oldKey == null) {
          patch(
            element,
            oldElements[i],
            oldChildren[i],
            children[k],
            lifecycle,
            isSVG,
            eventListener
          )
          k++
        }
        i++
      } else {
        const keyed = oldKeyed[newKey] || []

        if (oldKey === newKey) {
          patch(element, keyed[0], keyed[1], children[k], lifecycle, isSVG, eventListener)
          i++
        } else if (keyed[0]) {
          patch(
            element,
            element.insertBefore(keyed[0], oldElements[i]),
            keyed[1],
            children[k],
            lifecycle,
            isSVG,
            eventListener
          )
        } else {
          patch(element, oldElements[i], null, children[k], lifecycle, isSVG, eventListener)
        }

        newKeyed[newKey] = children[k]
        k++
      }
    }

    while (i < oldChildren.length) {
      if (getKey(oldChildren[i]) == null) {
        removeElement(element, oldElements[i], oldChildren[i])
      }
      i++
    }

    for (const key in oldKeyed) {
      if (!newKeyed[key]) {
        removeElement(element, oldKeyed[key][0], oldKeyed[key][1])
      }
    }
  }
  return element
}
