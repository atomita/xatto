import { isObservable } from './isObservable'
import { Observable } from './Observable'
import { Subscription } from './Subscription'

function nowaitPromise<T> (
  scheduleRender: Function,
  values: WeakMap<any, [any, (Error | null), NowaitState]>,
  promise: Promise<T>,
  defaultValue: T | null = null
) {
  if (!values.has(promise)) {
    values.set(promise, [defaultValue, null, NowaitState.pending])

    promise
      .then((value: any) => {
        values.set(promise, [value, null, NowaitState.fulfilled])
        scheduleRender()
      })
      .catch((err: any) => {
        values.set(promise, [null, err, NowaitState.rejected])
        scheduleRender()
      })
  }
  return values.get(promise) as [(T | null), (Error | null), NowaitState]
}

function nowaitObservable<T> (
  scheduleRender: Function,
  values: WeakMap<any, [any, (Error | null), NowaitState]>,
  subscriptions: Map<any, Subscription>,
  subscribeds: Set<any>,
  observable: Observable<T>,
  defaultValue: T | null = null
) {
  if (!values.has(observable)) {
    values.set(observable, [defaultValue, null, NowaitState.pending])
  }

  if (!subscriptions.has(observable)) {
    subscriptions.set(
      observable,
      observable.subscribe(
        (value) => {
          subscribeds.add(observable)
          values.set(observable, [value, null, NowaitState.acquired])
          scheduleRender()
        },
        (err) => {
          subscribeds.add(observable)
          values.set(observable, [null, err, NowaitState.rejected])
          scheduleRender()
        },
        () => {
          const value = values.has(observable)
            ? (values.get(observable) as [
                (T | null),
                (Error | null),
                NowaitState
              ])[0]
            : null

          subscribeds.add(observable)
          values.set(observable, [value, null, NowaitState.fulfilled])
          scheduleRender()
        }
      )
    )
  }

  if (subscribeds.has(observable)) {
    subscribeds.delete(observable)
  }

  return values.get(observable) as [(T | null), (Error | null), NowaitState]
}

export enum NowaitState {
  pending = 0,
  fulfilled,
  rejected,
  acquired
}

export type Nowait = <T>(
  mayBeAsync: T | Promise<T> | Observable<T> | null | undefined,
  defaultValue: T | null
) => [(T | null), (Error | null), NowaitState]

export function createNowait (
  scheduleRender: Function,
  values: WeakMap<any, [any, (Error | null), NowaitState]>,
  subscriptions: Map<any, Subscription>,
  subscribeds: Set<any>
): Nowait {
  return <T>(
    mayBeAsync: T | Promise<T> | Observable<T> | null | undefined,
    defaultValue: T | null = null
  ) => {
    if (null == mayBeAsync) {
      return [defaultValue, null, NowaitState.fulfilled]
    }

    if (mayBeAsync instanceof Promise) {
      return nowaitPromise(scheduleRender, values, mayBeAsync, defaultValue)
    }

    if (isObservable(mayBeAsync)) {
      return nowaitObservable(
        scheduleRender,
        values,
        subscriptions,
        subscribeds,
        mayBeAsync as Observable<T>,
        defaultValue
      )
    }

    if (mayBeAsync instanceof Error) {
      return [null, mayBeAsync, NowaitState.rejected]
    }

    return [mayBeAsync as T, null, NowaitState.fulfilled]
  }
}

export function createNowaitUnsubscribe (
  subscriptions: Map<any, Subscription>,
  subscribeds: Set<any>
) {
  return () => {
    subscribeds.forEach((target) => {
      if (subscriptions.has(target)) {
        const subscription = subscriptions.get(target)!
        subscriptions.delete(target)
        subscription.unsubscribe()
      }
    })

    subscribeds.clear()
  }
}
