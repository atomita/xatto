import { Component } from './Component'
import { CONTEXT } from './consts/attributeNames'
import { MIDDLEWARES } from './consts/optionNames'
import { PROPS } from './consts/vNodeAttributeNames'
import { createGlueNodeByElement } from './createGlueNodeByElement'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { GlueNode } from './GlueNode'
import { mutateProvider } from './mutateProvider'
import { nowaitProvider } from './nowaitProvider'
import { remodelProps } from './remodelProps'
import { rendererProvider } from './rendererProvider'
import { rendering } from './rendering'

/**
 * atto
 *
 * @param  view Component
 * @param  containerOrGlueNode Element | GlueNode
 * @param  options object default: `{}`
 * @return (context: any, path?: string) => void
 */
export function atto (
  view: Component,
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

  const [nowait, nowaitUnsubscribe] = nowaitProvider(scheduleRender)

  const extra = { mutate, nowait }

  const rendererProviders = [rendererProvider]
    .concat(middlewares)
    .map((provider: Function) =>
      provider(mutate, getContext, setContext, view, glueNode)
    )

  function getContext (path: string, def: any = {}) {
    return (path ? deepGet(rootContext, path) : rootContext) || def
  }

  function setContext (newContext: any, path?: string) {
    if (path) {
      deepSet(rootContext, path, newContext)
    } else {
      rootContext = newContext
    }
  }

  function render () {
    try {
      renderNow = true

      glueNode = rendering(
        glueNode,
        view,
        extra,
        rendererProviders.map((provider) => provider())
      )
    } finally {
      renderNow = scheduled = false
    }
  }

  function rendered () {
    if (rerender) {
      rerender = false
      scheduleRender()
    } else {
      nowaitUnsubscribe()
    }
  }

  function renderedError (e) {
    rendered()
    throw e
  }

  function scheduleRender () {
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
