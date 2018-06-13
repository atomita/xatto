import { ATTRIBUTES, CHILDREN } from './consts/vdomAttributeNames';
import { CONTEXT, XA_CONTEXT } from './consts/attributeNames'
import { ElementExtends } from './ElementExtends'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { patch } from './patch'
import { resolveNode } from './resolveNode'
import { x } from './x'

export function atto(
  view: (attributes: any, children: any[]) => any,
  element: Element & ElementExtends,
  oldNode: any = null
) {

  let scheduled = false

  const attributes = oldNode && oldNode[ATTRIBUTES] || {}

  const rootContext: any = deepGet(attributes, CONTEXT) || attributes[XA_CONTEXT] || {} // todo mixed to be deprecated
  deepSet(attributes, CONTEXT, rootContext)
  attributes[XA_CONTEXT] = rootContext // todo to be deprecated

  function mutate(context: any, actualContext = rootContext, path: string | null = null) {
    if (context && context !== actualContext) {
      if (context instanceof Promise) {
        context.then(newContext => mutate(newContext, actualContext, path))
      } else if ('object' === typeof context) {
        if (null == path && 'string' === typeof actualContext) {
          path = actualContext
          actualContext = rootContext
        }
        const targetContext = path ? (deepGet(actualContext, path) || {}) : actualContext

        Object.entries(context).map(([k, v]) => targetContext[k] = v)

        if (path) {
          deepSet(actualContext, path, targetContext)
        }
      }
    }
    scheduleRender()
  }

  function eventListener(event: Event) {
    const element = event.currentTarget as Element & ElementExtends

    element.context = element.context || {}
    element.extra = element.extra || {}

    const context = element.events[event.type](event, element.context, element.extra)

    mutate(context, element.context)
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

  return mutate
}

