import { GlueNode } from './GlueNode';
import { Props } from './Props';
export interface PatchStack {
    (glueNode: GlueNode, isSVG: boolean, eventProxy: (e: Event) => void, elementProps: WeakMap<Element, Props>, isDestroy: boolean): GlueNode | null;
}
