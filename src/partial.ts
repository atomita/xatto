import { apply } from './apply'

export function partial(fn: Function, args: any[]): Function {
  return (...backwardArgs) => apply(fn, args.concat(backwardArgs))
}
