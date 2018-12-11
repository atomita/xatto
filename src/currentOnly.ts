/**
 * @param  eventHandler {Function}
 * @return {Function}
 */
export function currentOnly(eventHandler: Function) {
  return (context, detail, props, event) => {
    if (event.currentTarget === event.target) {
      return eventHandler(context, detail, props, event)
    }
  }
}
