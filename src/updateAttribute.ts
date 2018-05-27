import { ElementExtends } from './ElementExtends'

export function updateAttribute(
  element: Element & ElementExtends,
  name,
  value,
  oldValue,
  isSVG: Boolean,
  eventListener
) {
  if (name === "key" || 'object' === typeof value) {
    // noop
  } else {
    if (name[0] === "o" && name[1] === "n") {
      if (!element.events) {
        element.events = {}
      }
      element.events[(name = name.slice(2))] = value

      if (value) {
        if (!oldValue) {
          element.addEventListener(name, eventListener)
        }
      } else {
        element.removeEventListener(name, eventListener)
      }
    } else if (name in element && name !== "list" && !isSVG) {
      element[name] = value == null ? "" : value
    } else if (value != null && value !== false) {
      element.setAttribute(name, value)
    }

    if (value == null || value === false) {
      element.removeAttribute(name)
    }
  }
}
