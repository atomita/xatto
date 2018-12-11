import { assign } from "./assign";

export function fireLifeCycleEventProvider(elm: Node, type: string, detail: any = {}) {
  const events = [
    new CustomEvent('lifecycle', { detail: assign({ type }, detail) }),
    new CustomEvent(type, { detail })
  ]
  return () => events.map((event) => elm.dispatchEvent(event))
}
