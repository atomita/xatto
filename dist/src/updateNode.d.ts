import { Props } from './Props';
import { GlueNode } from './GlueNode';
export declare function updateNode(glueNode: GlueNode, isSVG: Boolean, eventProxy: (e: Event) => void, eventTargetProps: WeakMap<EventTarget, Props>): [Node, boolean];
