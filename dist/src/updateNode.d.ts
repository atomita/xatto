import { GlueNode } from './GlueNode';
import { Props } from './Props';
export declare function updateNode(glueNode: GlueNode, isSVG: Boolean, eventProxy: (e: Event) => void, eventTargetProps: WeakMap<EventTarget, Props>): [Node, boolean];
