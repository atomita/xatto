import { Props } from './Props';
export interface VNode {
    children: VNode[];
    key: any;
    name: string | ((props_: Props, chilren_: VNode[]) => VNode);
    props: any;
}
