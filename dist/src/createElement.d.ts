import { GlueNode } from './GlueNode';
import { Props } from './Props';
export declare function createElement(node: GlueNode, isSVG: Boolean, eventProxy: (e: Event) => void, elementProps: WeakMap<Element, Props>): Element | Node;
