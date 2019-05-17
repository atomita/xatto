import { VNode } from './VNode';
export declare type Component = (props?: any, children?: VNode[], context?: any, extra?: any) => VNode | undefined | null | true | false;
