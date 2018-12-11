export function fireLifeCycleEventProvider(elm: Node, eventName: string, option: any = {}) {
  const event = new CustomEvent(eventName, option)
  return () => elm.dispatchEvent(event)
}
