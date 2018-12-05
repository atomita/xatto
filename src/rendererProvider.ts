import { Props } from "./Props";
import { eventProxyProvider } from "./eventProxyProvider";
import { patcherProvider } from "./patcherProvider";
import { resolverProvider } from "./resolverProvider";

export function rendererProvider(mutate, getContext, setContext/*, view, glueNode */) {
  const elementProps = new WeakMap<Element, Props>()
  const eventProxy = eventProxyProvider(mutate, getContext, elementProps)

  return () => {
    const destroys: Function[] = []
    const lifecycleEvents: Function[] = []

    return [
      // resolver
      resolverProvider(
        getContext,
        setContext
      ),

      // pather
      patcherProvider(
        mutate,
        destroys,
        lifecycleEvents,
        eventProxy,
        elementProps
      ),

      // finallyer
      () => () => {
        lifecycleEvents.reduceRight((_, lifecycleEvent) => lifecycleEvent(), 0)

        destroys.reduceRight((_, destroy) => destroy(), 0)
      },
    ] as [Function | undefined, Function | undefined, Function | undefined]
  }
}

