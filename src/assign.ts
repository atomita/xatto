export function assign(target: any, source: any) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }
  return target
}
