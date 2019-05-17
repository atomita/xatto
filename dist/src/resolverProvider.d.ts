import { ResolvedVNode } from './ResolvedVNode';
import { Resolver } from './resolver';
import { VNode } from './VNode';
export declare function resolverProvider(getContext: any, setContext: any): (next: Resolver, recursion: Resolver) => (node: VNode, parentNode?: VNode | ResolvedVNode | undefined) => ResolvedVNode[];
