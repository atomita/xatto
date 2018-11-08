export function apply(fn: Function, args: any[]): any {
  return fn.apply(null, args)
}
