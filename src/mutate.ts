import { assign } from './assign'
import { deepSet } from './deepSet'

export function mutate (
  getContext,
  setContext,
  scheduleRender,
  context: any,
  path: string
) {
  if (context) {
    if (context instanceof Promise) {
      return context.then((newContext) =>
        mutate(getContext, setContext, scheduleRender, newContext, path)
      )
    }

    if ('function' === typeof context) {
      return context(mutate, getContext)
    }

    if ('object' === typeof context) {
      const targetContext = getContext(path)

      if (context === targetContext) {
        return
      }

      const newContext = assign(assign({}, targetContext), context)

      setContext(newContext, path)

      scheduleRender()
    }
  }
}
