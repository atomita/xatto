import { Props } from './Props';
import { VNode } from './VNode';
export declare type Component = (props: Props, children: VNode[]) => VNode | undefined | null | true | false;
