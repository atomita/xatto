import { Component } from './Component';
export interface VNode {
    children: VNode[];
    key: any;
    name: string | Component | ((name: any, props: any, ...rest: any[]) => VNode);
    props: any;
}
