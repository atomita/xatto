import { ResolvedVNode } from './ResolvedVNode';
import { VNode } from './VNode';
export declare function resolverProvider(getContext: any, setContext: any): (next: Function, recursion: Function) => (node?: VNode | undefined, parentNode?: VNode | ResolvedVNode | undefined) => ResolvedVNode[];
