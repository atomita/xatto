export function isObservable (value: any) {
  return value.subscribe && 'function' == typeof value.subscribe
}
