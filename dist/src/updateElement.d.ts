import { Props } from './Props';
import { GlueNode } from './GlueNode';
export declare function updateElement(node: GlueNode, isSVG: Boolean, eventProxy: (e: Event) => void, elementProps: WeakMap<Element, Props>): [Element | Node, boolean];
