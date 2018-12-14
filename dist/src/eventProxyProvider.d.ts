import { Props } from './Props';
export declare function eventProxyProvider(mutate: any, getContext: any, eventTargetProps: WeakMap<EventTarget, Props>): (event: Event | CustomEvent<any>) => void;
