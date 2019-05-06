import { Observable } from './Observable';
import { Subscription } from './Subscription';
export declare enum NowaitState {
    pending = 0,
    fulfilled = 1,
    rejected = 2,
    acquired = 3
}
export declare type Nowait = <T>(mayBeAsync: T | Promise<T> | Observable<T> | null | undefined, defaultValue: T | null) => [(T | null), (Error | null), NowaitState];
export declare function createNowait(scheduleRender: Function, values: WeakMap<any, [any, (Error | null), NowaitState]>, subscriptions: Map<any, Subscription>, subscribeds: Set<any>): Nowait;
export declare function createNowaitUnsubscribe(subscriptions: Map<any, Subscription>, subscribeds: Set<any>): () => void;
