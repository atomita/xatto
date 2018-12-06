import { GlueNode } from './GlueNode';
import { Props } from './Props';
export declare function patcher(mutate: Function, destroys: Function[], lifecycleEvents: Function[], eventProxy: (e: Event) => void, elementProps: WeakMap<Element, Props>, elementRemoveds: WeakMap<Element, boolean>, next: Function, recursion: Function, glueNode: GlueNode, isSVG: boolean, captureLifecycle: string): GlueNode | null;
