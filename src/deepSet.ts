/**
 * Set an object item to a given value using separator notation.
 *
 * @param {any} target
 * @param {string} key
 * @param {any} value
 * @param {string} separator
 * @return {boolean}
 */
export function deepSet(target: any, key: string, value: any, separator: string = '.') {
  while (true) {
    if ('object' !== typeof target) {
      return false;
    }

    const idx = key.indexOf(separator);
    if (idx < 0) {
      target[key] = value;
      return true;
    }

    const current = key.slice(0, idx);
    const nexts = key.slice(idx + 1);

    if (null == target[current]) {
      const next = nexts.split(separator, 1)[0];
      target[current] = next === `${parseInt(next, 10)}` ? [] : {};
    }

    target = target[current];
    key = nexts;
  }
}
