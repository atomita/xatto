import { assign } from './assign'
import { CONTEXT } from './consts/attributeNames'
import { MIDDLEWARES } from './consts/optionNames'
import { PROPS } from './consts/vNodeAttributeNames'
import { createGlueNodeByElement } from './createGlueNodeByElement'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { GlueNode } from './GlueNode'
import { mutateProvider } from './mutateProvider'
import { Props } from './Props'
import { remodelProps } from './remodelProps'
import { rendererProvider } from './rendererProvider'
import { rendering } from './rendering'
import { VNode } from './VNode'
import { x } from './x'

/**
 * atto
 *
 * @param  view {(props: Props, children: VNode[]) => VNode}
 * @param  containerOrGlueNode {Element | GlueNode}
 * @param  options {object} default: `{}`
 * @return {Function}
 */
export function atto(
  view: (props: Props, children: VNode[]) => VNode,
  containerOrGlueNode: Element | GlueNode,
  options: any = {}
) {
  let scheduled = false
  let renderNow = false
  let rerender = false

  let glueNode =
    containerOrGlueNode instanceof Element
      ? createGlueNodeByElement(containerOrGlueNode)
      : (containerOrGlueNode as GlueNode)

  const rootProps = remodelProps(glueNode[PROPS])

  let rootContext: any = deepGet(rootProps, CONTEXT)

  const middlewares = (MIDDLEWARES in options && options[MIDDLEWARES]) || []

  const mutate = mutateProvider(getContext, setContext, scheduleRender)

  const rendererProviders = [rendererProvider]
    .concat(middlewares)
    .map((provider: Function) =>
      provider(mutate, getContext, setContext, view, glueNode)
    )

  function getContext(path: string, def: any = {}) {
    return (path ? deepGet(rootContext, path) : rootContext) || def
  }

  function setContext(newContext: any, path?: string) {
    if (path) {
      deepSet(rootContext, path, newContext)
    } else {
      rootContext = newContext
    }
  }

  function render() {
    try {
      renderNow = true

      glueNode = rendering(
        glueNode,
        view,
        rendererProviders.map((provider) => provider())
      )
    } finally {
      renderNow = false
    }
  }

  function rendered() {
    scheduled = false

    if (rerender) {
      rerender = false
      scheduleRender()
    }
  }

  function renderedError(e) {
    rendered()
    throw e
  }

  function scheduleRender() {
    if (!scheduled) {
      scheduled = true
      Promise.resolve()
        .then(render)
        .then(rendered, renderedError)
    } else if (renderNow) {
      rerender = true
    }
  }

  return mutate
}
