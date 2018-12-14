import { Component } from './Component';
import { VNode } from './VNode';
/**
 * x
 *
 * @param  name {string | Component}
 * @param  props {object}
 * @param  ... {object}
 * @return {VNode}
 */
export declare function x(name: string | Component | ((name: any, props: any, ...rest: any[]) => VNode), props: any, ...rest: any[]): VNode;
