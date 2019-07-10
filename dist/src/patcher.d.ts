import { GlueNode } from './GlueNode';
import { Props } from './Props';
export declare function patcher(mutate: Function, lifecycleEvents: Function[], eventProxy: (e: Event) => void, eventTargetProps: WeakMap<EventTarget, Props>, removedNodes: WeakMap<Node, boolean>, next: Function, recursion: Function, glueNode: GlueNode, isSVG: boolean): GlueNode | null;
