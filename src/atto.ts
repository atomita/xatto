import { CHILDREN, PROPS } from './consts/vNodeAttributeNames';
import { CONTEXT } from './consts/attributeNames'
import { ElementExtends } from './ElementExtends'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { patch } from './patch'
import { pickLifecycleEvents } from './pickLifecycleEvents'
import { resolveNode } from './resolveNode'
import { mergeGlueNode } from './mergeGlueNode'
import { x } from './x'

export function atto(
  view: (props: any, children: any[]) => any,
  elementOrGlueNode: Element & ElementExtends | any
) {

  let scheduled = false

  let glueNode = elementOrGlueNode instanceof Element
    ? {
      name: elementOrGlueNode.nodeName,
      props: {},
      children: [],
      element: elementOrGlueNode
    }
    : elementOrGlueNode

  const props = glueNode[PROPS]

  const rootContext: any = deepGet(props, CONTEXT) || {}
  deepSet(props, CONTEXT, rootContext)

  function mutate(context: any = null, actualContext = rootContext, path: string | null = null) {
    if (context && context !== actualContext) {
      if ('function' === typeof context) {
        return context(mutate, actualContext, rootContext)
      } else if (context instanceof Promise) {
        return context.then(newContext => mutate(newContext, actualContext, path))
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

  function eventProxy(event: Event) {
    const element = event.currentTarget as Element & ElementExtends

    element.context = element.context || {}
    element.extra = element.extra || {}

    const context = element.events[event.type](event, element.context, element.extra)

    mutate(context, element.context)
  }

  function render() {
    const lifecycleEvents: Function[] = []

    const node = mergeGlueNode(
      resolveNode(x(view, props, glueNode && glueNode[CHILDREN]), x('div', {}, [])),
      glueNode
    )

    const patchStack = [
      pickLifecycleEvents(lifecycleEvents, mutate)
    ].reduce(
      (acc, stack) => stack(acc),
      patch((...args) => patchStack.apply(null, args)))

    glueNode = patchStack(
      node,
      'svg' === node.name,
      eventProxy,
      false
    )

    lifecycleEvents.reduce((_, lifecycleEvent) => lifecycleEvent(), 0)
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

