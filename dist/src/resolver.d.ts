import { ResolvedVNode } from './ResolvedVNode';
import { VNode } from './VNode';
export declare type Resolver = (node?: VNode, parent?: VNode | ResolvedVNode) => ResolvedVNode[];
export declare function resolver(getContext: any, setContext: any, next: Resolver, recursion: Resolver, node?: VNode, parentNode?: VNode | ResolvedVNode): ResolvedVNode[];
