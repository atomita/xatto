import { FUNCTION } from './consts/typeNames'

export function isObservable (value: any) {
  return value.subscribe && FUNCTION == typeof value.subscribe
}
