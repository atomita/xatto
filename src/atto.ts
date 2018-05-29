import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames';
import { RECYCLE } from './consts/attributeNames'
import { ElementExtends } from './ElementExtends'
import { patch } from './patch'
import { resolveNode } from './resolveNode'
import { x } from './x'

export function atto(
  view: (attributes: any, children: any[]) => any,
  element: Element & ElementExtends,
  oldNode: any = null
): () => void {

  let scheduled = false

  const attributes = oldNode && oldNode[ATTRIBUTES] || {}

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

    const node = resolveNode(x(view, attributes, oldNode && oldNode[CHILDREN]), x('div', {}, []))

    element = patch(
      element.parentNode as Element,
      element,
      oldNode,
      (oldNode = node),
      lifecycle,
      'svg' === node.name,
      eventListener
    )

    attributes[RECYCLE] = false

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

