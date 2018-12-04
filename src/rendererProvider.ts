import { partial } from "./partial";
import { patch } from "./patch";
import { resolveNode } from "./resolveNode";

export function rendererProvider(mutate/* , elementProps, context, view, glueNode */) {
  return () => {
    const destroys: Function[] = []
    const lifecycleEvents: Function[] = []

    return [
      // resolver
      (
        next: Function,
        recursion: Function
      ) => partial(resolveNode, [next, recursion]),

      // pather
      (
        next: Function,
        recursion: Function
      ) => partial(patch, [mutate, destroys, lifecycleEvents, next, recursion]),

      // finallyer
      (next: Function) => () => {
        lifecycleEvents.reduceRight((_, lifecycleEvent) => lifecycleEvent(), 0)

        destroys.reduceRight((_, destroy) => destroy(), 0)

        next()
      },
    ] as [Function | undefined, Function | undefined, Function | undefined]
  }
}
