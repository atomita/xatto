import { ATTRIBUTES, CHILDREN, NAME } from './consts/vdomAttributeNames'
import { CONTEXT, EXTRA, TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { resolveNode } from './resolveNode'
import { updateAttribute } from './updateAttribute'

export function createElement(
  node: any,
  lifecycle: Array<() => void>,
  isSVG: Boolean,
  eventListener
) {
  const isTextNode = node[NAME] === TEXT_NODE
  const element =
    isTextNode
      ? document.createTextNode(node[ATTRIBUTES][TEXT] as string)
      : (isSVG = isSVG || node[NAME] === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node[NAME])
        : document.createElement(node[NAME])

  const attributes = node[ATTRIBUTES]
  if (attributes) {
    const callback = attributes.oncreate
    if (callback) {
      lifecycle.push(function() {
        callback(element, {}, attributes[CONTEXT], attributes[EXTRA])
      })
    }

    if (isTextNode) {
      element.nodeValue = node[ATTRIBUTES][TEXT]
    } else {
      for (let i = 0; i < node[CHILDREN].length; i++) {
        element.appendChild(createElement(
          (node[CHILDREN][i] = resolveNode(node[CHILDREN][i], node)),
          lifecycle,
          isSVG,
          eventListener
        ))
      }

      for (const name in attributes) {
        updateAttribute(element, name, attributes[name], null, isSVG, eventListener)
      }
    }

    element.context = attributes[CONTEXT]
    element.extra = attributes[EXTRA]
  }

  return element
}
