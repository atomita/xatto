import { CONTEXT } from './consts/attributeNames'
import { GlueNode } from './GlueNode'
import { MIDDLEWARES } from './consts/optionNames'
import { PROPS } from './consts/vNodeAttributeNames';
import { Props } from './Props'
import { VNode } from './VNode'
import { assign } from './assign'
import { createGlueNodeByElement } from './createGlueNodeByElement';
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { remodelProps } from './remodelProps';
import { rendererProvider } from './rendererProvider';
import { rendering } from './rendering';
import { x } from './x'

export function atto(
  view: (props: Props, children: VNode[]) => VNode,
  elementOrGlueNode: Element | GlueNode,
  options: any = {}
) {

  let scheduled = false

  let glueNode = elementOrGlueNode instanceof Element
    ? createGlueNodeByElement(elementOrGlueNode)
    : elementOrGlueNode as GlueNode

  const rootProps = remodelProps(glueNode[PROPS])

  let rootContext: any = deepGet(rootProps, CONTEXT)

  const middlewares = MIDDLEWARES in options && options[MIDDLEWARES] || []

  const rendererProviders = [rendererProvider]
    .concat(middlewares)
    .map((provider: Function) => provider(mutate, getContext, view, glueNode))

  function mutate(context: any, path: string = '') {
    if (context) {
      if (context instanceof Promise) {
        return context.then(newContext => mutate(newContext, path))
      }

      if ('function' === typeof context) {
        return context(mutate, rootContext)
      }

      if ('object' === typeof context) {
        const targetContext = getContext(path)

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

  function getContext(path: string, def: any = {}) {
    return (path ? deepGet(rootContext, path) : rootContext) || def
  }

  function render() {
    glueNode = rendering(
      glueNode,
      view,
      rootContext,
      rendererProviders.map(provider => provider(rootContext))
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
