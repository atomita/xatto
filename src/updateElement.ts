import { CONTEXT, EXTRA, RECYCLE } from './consts/attributeNames'
import { ElementExtends } from './ElementExtends'
import { updateAttribute } from './updateAttribute'

export function updateElement(
  element: Element & ElementExtends,
  oldAttributes: any,
  attributes: any,
  lifecycle: Array<() => void>,
  isSVG: Boolean,
  eventListener
) {
  const attrs = {
    ...oldAttributes,
    ...attributes
  }
  for (const name in attrs) {
    if (
      attributes[name] !==
      (name === "value" || name === "checked"
        ? element[name]
        : oldAttributes[name])
    ) {
      updateAttribute(
        element,
        name,
        attributes[name],
        oldAttributes[name],
        isSVG,
        eventListener
      )
    }
  }

  element.context = attributes[CONTEXT]
  element.extra = attributes[EXTRA]

  const callback = attributes[RECYCLE] ? attributes.oncreate : attributes.onupdate
  if (callback) {
    lifecycle.push(function() {
      callback(element, oldAttributes, attributes[CONTEXT], attributes[EXTRA])
    })
  }
}
