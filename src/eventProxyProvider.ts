import { PATH } from "./consts/attributeNames";
import { Props } from "./Props";
import { deepGet } from "./deepGet";

export function eventProxyProvider(
  mutate,
  getContext,
  eventTargetProps: WeakMap<EventTarget, Props>
) {
  return (event: Event | CustomEvent) => {
    const node = event.currentTarget!

    const props = eventTargetProps.get(node) || {}

    const path = deepGet(props, PATH) || ''

    const detail = (event as CustomEvent).detail || {}

    const newContext = props!["on" + event.type](getContext(path), detail, props, event)

    mutate(newContext, path)
  }
}
