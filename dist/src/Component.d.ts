import { VNode } from './VNode';
export declare type Component = (props: any, children: VNode[]) => VNode | undefined | null | true | false;
