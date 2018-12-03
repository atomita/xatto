export function currentOnlyEventHandler(eventHandler: Function) {
  return (context, props, event) => {
    if (event.currentTarget === event.target) {
      return eventHandler(context, props, event)
    }
  }
}
