/**
 * Get an item from an object using separator notation.
 *
 * @typeparam {T}
 * @param {any} target
 * @param {string} key
 * @param {string} separator
 * @return {T}
 */
export function deepGet<T> (
  target: any,
  key: string,
  separator: string = '.'
): T {
  while (true) {
    if (target == null) {
      return target
    }

    const idx = key.indexOf(separator)
    if (idx < 0) {
      return target[key]
    }

    target = target[key.slice(0, idx)]
    key = key.slice(idx + 1)
  }
}
