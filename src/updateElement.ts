import { ElementExtends } from './ElementExtends'
import { XA_CONTEXT, XA_EXTRA, XA_RECYCLE } from './consts'
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

  element.context = attributes[XA_CONTEXT]
  element.extra = attributes[XA_EXTRA]

  const callback = attributes[XA_RECYCLE] ? attributes.oncreate : attributes.onupdate
  if (callback) {
    lifecycle.push(function() {
      callback(element, oldAttributes)
    })
  }
}
