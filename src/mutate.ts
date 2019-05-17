import { assign } from './assign'
import { FUNCTION, OBJECT } from './consts/typeNames'

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

    if (FUNCTION === typeof context) {
      return context(mutate, getContext)
    }

    if (OBJECT === typeof context) {
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
