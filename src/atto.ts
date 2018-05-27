import { CHILDREN } from './consts';
import { ElementExtends } from './ElementExtends'
import { getAttributes } from './getAttributes'
import { patch } from './patch'
import { recycleElement } from './recycleElement'
import { resolveNode } from './resolveNode'
import { x } from './x'

export function atto(
  view: (attributes: any, children: any[]) => any,
  element: Element & ElementExtends
): () => void {

  let oldNode = recycleElement(element)
  let scheduled = false

  const attributes = getAttributes(element)

  function eventListener(event: Event) {
    const element = event.currentTarget as Element & ElementExtends

    mutate(element.events[event.type](event, element.context || {}, element.extra || {}))

    function mutate(context) {
      if (context && context !== element.context) {
        if (context instanceof Promise) {
          context.then(mutate)
        } else if ('function' === typeof context.subscribe) {
          context.subscribe(mutate) // @todo unsubscribe
        } else if ('object' === typeof context) {
          Object.entries(context).map(([k, v]) => element.context[k] = v)
          scheduleRender()
        }
      }
    }
  }

  function render() {
    const lifecycle: Array<() => any> = []

    const node = resolveNode(x(view, attributes, oldNode[CHILDREN]), x('div', {}, []))

    element = patch(
      element.parentNode as Element,
      element,
      oldNode,
      (oldNode = node),
      lifecycle,
      'svg' === node.name,
      eventListener
    )

    while (lifecycle.length) lifecycle.pop()!()
  }

  function rendered() {
    scheduled = false
  }

  function renderedError(e) {
    rendered()
    throw e
  }

  function scheduleRender() {
    if (!scheduled) {
      scheduled = true
      Promise.resolve().then(render).then(rendered, renderedError)
    }
  }

  return scheduleRender
}

