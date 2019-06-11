import { EXTRA, PATH } from './consts/attributeNames'
import { deepGet } from './deepGet'
import { Props } from './Props'

export function eventProxyProvider (
  mutate,
  getContext,
  eventTargetProps: WeakMap<EventTarget, Props>
) {
  return (event: Event | CustomEvent) => {
    const node = event.currentTarget!

    const props = eventTargetProps.get(node) || {}

    const path = deepGet(props, PATH) || ''

    const detail = (event as CustomEvent).detail || {}

    const extra = deepGet(props, EXTRA) || {}

    const element = event.target

    const newContext = props!['on' + event.type](
      getContext(path),
      {
        ...extra,
        ...detail,
        dispatch: (name, dtl = {}) => {
          element &&
            element.dispatchEvent(
              new CustomEvent(name, {
                bubbles: true,
                cancelable: true,
                detail: dtl
              })
            )
        }
      },
      props,
      event
    )

    mutate(newContext, path)
  }
}
