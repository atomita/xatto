export function x(name, attributes, ...rest) {
  const children: any[] = []

  while (rest.length) {
    const node = rest.pop()
    if (node && Array.isArray(node)) {
      rest = rest.concat(node)
    } else if (node != null && node !== true && node !== false) {
      children.unshift(node)
    }
  }

  return {
    name: name,
    attributes: attributes || {},
    children: children,
    key: attributes && attributes.key
  }
}
