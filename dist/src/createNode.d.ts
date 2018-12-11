import { GlueNode } from './GlueNode';
import { Props } from './Props';
export declare function createNode(glueNode: GlueNode, isSVG: Boolean, eventProxy: (e: Event) => void, eventTargetProps: WeakMap<EventTarget, Props>): Element | Node;
