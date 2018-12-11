/**
 * @param  eventHandler {Function}
 * @return {Function}
 */
export function currentOnly(eventHandler: Function) {
  return (context, props, event) => {
    if (event.currentTarget === event.target) {
      return eventHandler(context, props, event)
    }
  }
}
