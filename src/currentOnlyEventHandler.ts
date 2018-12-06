const memorize = new WeakMap()

export function currentOnlyEventHandler(eventHandler: Function) {
  if (!memorize.has(eventHandler)) {
    memorize.set(
      eventHandler,
      (context, props, event) => {
        if (event.currentTarget === event.target) {
          return eventHandler(context, props, event)
        }
      }
    )
  }
  return memorize.get(eventHandler)
}
