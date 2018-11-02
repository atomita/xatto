import { Props } from './Props';
export declare function pickLifecycleEvents(lifecycleEvents: any[], mutate: Function): (stack: Function) => (glueNode: any, isSVG: any, eventProxy: (e: Event) => void, elementProps: WeakMap<Element, Props>, isDestroy?: boolean) => any;
