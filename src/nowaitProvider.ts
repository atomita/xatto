import {
  createNowait,
  createNowaitUnsubscribe,
  Nowait,
  NowaitState
} from './nowait'
import { Subscription } from './Subscription'

export function nowaitProvider (scheduleRender: Function): [Nowait, Function] {
  const values = new WeakMap<any, [any, (Error | null), NowaitState]>()
  const subscriptions = new Map<any, Subscription>()
  const subscribeds = new Set<any>()

  return [
    createNowait(scheduleRender, values, subscriptions, subscribeds),
    createNowaitUnsubscribe(subscriptions, subscribeds)
  ]
}
