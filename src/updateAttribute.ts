import { ElementExtends } from './ElementExtends'
import { XLINK_NS } from './consts/namespaces'

export function updateAttribute(
  element: Element & ElementExtends,
  name,
  value,
  oldValue,
  isSVG: Boolean,
  eventProxy
) {
  if (name === "key" || 'object' === typeof value) {
    // noop
  } else {
    if (name[0] === "o" && name[1] === "n") {
      if (!element.events) {
        element.events = {}
      }
      element.events[(name = name.slice(2))] = value

      if (value == null) {
        element.removeEventListener(name, eventProxy)
      } else if (oldValue == null) {
        element.addEventListener(name, eventProxy)
      }
    } else {
      const nullOrFalse = value == null || value === false

      if (
        name in element &&
        name !== "list" &&
        name !== "draggable" &&
        name !== "spellcheck" &&
        name !== "translate" &&
        !isSVG
      ) {
        if (nullOrFalse) {
          element.removeAttribute(name)
        } else {
          element[name] = value == null ? "" : value
        }
      } else {
        let ns = false
        if (isSVG) {
          const originName = name
          name = name.replace(/^xlink:?/, "")
          ns = name !== originName
        }

        switch ((nullOrFalse ? 1 : 0) + ((ns ? 1 : 0) << 1)) {
          case 0:
            element.setAttribute(name, value)
            break
          case 1:
            element.removeAttribute(name)
            break
          case 2:
            element.setAttributeNS(XLINK_NS, name, value)
            break
          case 3:
            element.removeAttributeNS(XLINK_NS, name)
        }
      }
    }
  }
}
