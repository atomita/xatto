import { CONTEXT, EXTRA, XA_CONTEXT, XA_EXTRA } from './consts/attributeNames'
import { ElementExtends } from './ElementExtends'
import { deepGet } from './deepGet'
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

  element.context = deepGet(attributes, CONTEXT) || attributes[XA_CONTEXT]
  element.extra = deepGet(attributes, EXTRA) || attributes[XA_EXTRA]

  const callback = element.recycle ? attributes.oncreate : attributes.onupdate
  element.recycle = false

  if (callback) {
    lifecycle.push(function() {
      callback(element, oldAttributes, attributes)
    })
  }
}
