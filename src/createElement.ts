import { ATTRIBUTES, CHILDREN, XA_CONTEXT, XA_EXTRA } from './consts'
import { resolveNode } from './resolveNode'
import { updateAttribute } from './updateAttribute'

export function createElement(
  node: any,
  lifecycle: Array<() => void>,
  isSVG: Boolean,
  eventListener
) {
  const element =
    typeof node === "string" || typeof node === "number"
      ? document.createTextNode(node as string)
      : (isSVG = isSVG || node.name === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.name)
        : document.createElement(node.name)

  const attributes = node[ATTRIBUTES]
  if (attributes) {
    const callback = attributes.oncreate
    if (callback) {
      lifecycle.push(function() {
        callback(element)
      })
    }

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

    element.context = attributes[XA_CONTEXT]
    element.extra = attributes[XA_EXTRA]
  }

  return element
}
