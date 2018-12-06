import { PATH } from "./consts/attributeNames";
import { Props } from "./Props";
import { deepGet } from "./deepGet";

export function eventProxyProvider(
  mutate,
  getContext,
  elementProps: WeakMap<Element, Props>
) {
  return (event: Event | CustomEvent) => {
    const element = event.currentTarget as Element

    const props = elementProps.get(element)

    const path = deepGet(props, PATH) as string

    const detail = (event as CustomEvent).detail || {}

    const newContext = props!["on" + event.type](getContext(path), detail, props, event)

    mutate(newContext, path)
  }
}
