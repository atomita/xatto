import { CONTEXT, PATH } from './consts/attributeNames'
import { GlueNode } from './GlueNode'
import { PROPS } from './consts/vNodeAttributeNames';
import { Props } from './Props'
import { VNode } from './VNode'
import { assign } from './assign'
import { createGlueNodeByElement } from './createGlueNodeByElement';
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { remodelProps } from './remodelProps';
import { rendering } from './rendering';
import { x } from './x'

export function atto(
  view: (props: Props, children: VNode[]) => VNode,
  elementOrGlueNode: Element | GlueNode
) {

  let scheduled = false

  let glueNode = elementOrGlueNode instanceof Element
    ? createGlueNodeByElement(elementOrGlueNode)
    : elementOrGlueNode as GlueNode

  const rootProps = remodelProps(glueNode[PROPS])

  let rootContext: any = deepGet(rootProps, CONTEXT)

  const elementProps = new WeakMap<Element, Props>()

  function mutate(context: any, path: string = '') {
    if (context) {
      if (context instanceof Promise) {
        return context.then(newContext => mutate(newContext, path))
      }

      if ('function' === typeof context) {
        return context(mutate, rootContext)
      }

      if ('object' === typeof context) {
        const targetContext = getTargetContext(path || '')

        if (context === targetContext) {
          return
        }

        const newContext = assign(assign({}, targetContext), context)

        if (path) {
          deepSet(rootContext, path, newContext)
        } else {
          rootContext = newContext
        }

        scheduleRender()
      }
    }
  }

  function getTargetContext(path: string, def: any = {}) {
    return (path ? deepGet(rootContext, path) : rootContext) || def
  }

  function eventProxy(event: Event) {
    const element = event.currentTarget as Element

    const props = elementProps.get(element)
    const path = deepGet(props, PATH) as string

    const newContext = props!["on" + event.type](getTargetContext(path), props, event)

    mutate(newContext, path)
  }

  function render() {
    glueNode = rendering(
      glueNode,
      view,
      rootContext,
      mutate,
      eventProxy,
      elementProps
    )
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
