export function getAttributes(element: Element & { getAttributeNames: () => string[] }): any {
  return element.getAttributeNames().reduce(
    (acc, k) => {
      acc[k] = element.getAttribute(k)
      return acc
    },
    {})
}
