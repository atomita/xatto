import { GlueNode } from './GlueNode';
import { ResolvedVNode } from './ResolvedVNode';
export declare function glueNodeMergerProvider(removedNodes: WeakMap<Node, boolean>): (next: Function, recursion: Function) => (captureLifecycle: string, vNode?: ResolvedVNode | undefined, glueNode?: GlueNode | undefined) => GlueNode;
