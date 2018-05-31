/**
 * Get an item from an object using separator notation.
 *
 * @typeparam {T}
 * @param {any} target
 * @param {string} key
 * @param {string} separator
 * @return {T}
 */
export declare function deepGet<T>(target: any, key: string, separator?: string): T;
