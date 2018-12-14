import { GlueNode } from './GlueNode';
import { Props } from './Props';
import { VNode } from './VNode';
/**
 * atto
 *
 * @param  view {(props: Props, children: VNode[]) => VNode}
 * @param  containerOrGlueNode {Element | GlueNode}
 * @param  options {object} default: `{}`
 * @return {Function}
 */
export declare function atto(view: (props: Props, children: VNode[]) => VNode, containerOrGlueNode: Element | GlueNode, options?: any): (context: any, path?: string) => any;
