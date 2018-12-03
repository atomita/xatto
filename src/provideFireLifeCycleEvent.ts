export function provideFireLifeCycleEvent(elm: Element, eventName: string, option: any = {}) {
  const event = new CustomEvent(eventName, option)
  return () => elm.dispatchEvent(event)
}
