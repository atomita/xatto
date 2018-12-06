import { GlueNode } from './GlueNode';
import { Props } from './Props';
import { VNode } from './VNode';
export declare function atto(view: (props: Props, children: VNode[]) => VNode, elementOrGlueNode: Element | GlueNode, options?: any): (context: any, path: any) => any;
