import { Component } from './Component';
import { GlueNode } from './GlueNode';
/**
 * atto
 *
 * @param  view Component
 * @param  containerOrGlueNode Element | GlueNode
 * @param  options object default: `{}`
 * @return (context: any, path?: string) => void
 */
export declare function atto(view: Component, containerOrGlueNode: Element | GlueNode, options?: any): (context: any, path?: string) => any;
