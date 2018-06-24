import { ATTRIBUTES, CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { CONTEXT, EXTRA, TEXT, XA_CONTEXT, XA_EXTRA } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { resolveNode } from './resolveNode'
import { updateAttribute } from './updateAttribute'

export function createElement(
  node: any,
  lifecycle: Array<() => void>,
  isSVG: Boolean,
  eventListener
) {
  const attributes = node[ATTRIBUTES]
  const isTextNode = node[NAME] === TEXT_NODE
  const element =
    isTextNode
      ? document.createTextNode(deepGet(attributes, TEXT) as string)
      : (isSVG = isSVG || node[NAME] === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node[NAME])
        : document.createElement(node[NAME])

  if (attributes) {
    const callback = attributes.oncreate
    if (callback) {
      lifecycle.push(function() {
        callback(
          element,
          {},
          deepGet(attributes, CONTEXT) || attributes[XA_CONTEXT], // todo mixed to be deprecated
          deepGet(attributes, EXTRA) || attributes[XA_EXTRA] // todo mixed to be deprecated
        )
      })
    }

    if (isTextNode) {
      // noop
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

    element.context = deepGet(attributes, CONTEXT) || attributes[CONTEXT] // todo mixed to be deprecated
    element.extra = deepGet(attributes, EXTRA) || attributes[EXTRA] // todo mixed to be deprecated
  }

  return element
}
