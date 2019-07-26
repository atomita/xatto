export function updateAttribute (
  element: Element,
  name,
  value,
  oldValue,
  isSVG: Boolean,
  eventProxy: (e: Event) => void
) {
  if (name[0] === 'o' && name[1] === 'n') {
    const eventName = name.slice(2)
    if (!(value instanceof Function)) {
      element.removeEventListener(eventName, eventProxy)
    } else if (!(oldValue instanceof Function)) {
      element.addEventListener(eventName, eventProxy)
    }
  } else if (!isSVG && name !== 'list' && name in element) {
    element[name] = value == null ? '' : value
  } else if (value == null || value === false) {
    element.removeAttribute(name)
  } else {
    element.setAttribute(name, value)
  }
}
