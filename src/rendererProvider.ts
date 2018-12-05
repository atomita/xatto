import { Props } from "./Props";
import { eventProxyProvider } from "./eventProxyProvider";
import { partial } from "./partial";
import { patch } from "./patch";
import { resolveNode } from "./resolveNode";

export function rendererProvider(mutate, getContext/*, view, glueNode */) {
  return () => {
    const destroys: Function[] = []
    const lifecycleEvents: Function[] = []

    const elementProps = new WeakMap<Element, Props>()
    const eventProxy = eventProxyProvider(mutate, getContext, elementProps)

    return [
      // resolver
      (
        next: Function,
        recursion: Function
      ) => partial(
        resolveNode, [
          getContext,
          next,
          recursion
        ]
      ),

      // pather
      (
        next: Function,
        recursion: Function
      ) => partial(
        patch, [
          mutate,
          destroys,
          lifecycleEvents,
          eventProxy,
          elementProps,
          next,
          recursion
        ]
      ),

      // finallyer
      () => () => {
        lifecycleEvents.reduceRight((_, lifecycleEvent) => lifecycleEvent(), 0)

        destroys.reduceRight((_, destroy) => destroy(), 0)
      },
    ] as [Function | undefined, Function | undefined, Function | undefined]
  }
}
