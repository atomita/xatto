import { GlueNode } from './GlueNode';
import { Props } from './Props';
export declare function patch(mutate: Function, destroys: Function[], lifecycleEvents: Function[], next: Function, recursion: Function, glueNode: GlueNode, isSVG: boolean, eventProxy: (e: Event) => void, elementProps: WeakMap<Element, Props>, isDestroy: boolean): GlueNode | null;
