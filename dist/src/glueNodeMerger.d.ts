import { GlueNode } from './GlueNode';
import { ResolvedVNode } from './ResolvedVNode';
export declare function glueNodeMerger(removedNodes: WeakMap<Node, boolean>, next: Function, recursion: Function, captureLifecycle: string, vNode?: ResolvedVNode, glueNode?: GlueNode): GlueNode;
