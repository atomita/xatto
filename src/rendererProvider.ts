import { eventProxyProvider } from './eventProxyProvider'
import { glueNodeMergerProvider } from './glueNodeMergerProvider'
import { patcherProvider } from './patcherProvider'
import { Props } from './Props'
import { resolverProvider } from './resolverProvider'

export function rendererProvider (
  mutate,
  getContext,
  setContext /*, view, glueNode */
) {
  const eventTargetProps = new WeakMap<EventTarget, Props>()
  const removedNodes = new WeakMap<Node, boolean>()
  const eventProxy = eventProxyProvider(mutate, getContext, eventTargetProps)

  return () => {
    const destroys: Function[] = []
    const lifecycleEvents: Function[] = []

    return [
      // resolver
      resolverProvider(getContext, setContext),

      // meger
      glueNodeMergerProvider(removedNodes),

      // pather
      patcherProvider(
        mutate,
        destroys,
        lifecycleEvents,
        eventProxy,
        eventTargetProps,
        removedNodes
      ),

      // finallyer
      () => () => {
        lifecycleEvents.reduceRight((_, lifecycleEvent) => lifecycleEvent(), 0)

        destroys.reduceRight((_, destroy) => destroy(), 0)
      }
    ] as [
      Function | undefined,
      Function | undefined,
      Function | undefined,
      Function | undefined
    ]
  }
}
