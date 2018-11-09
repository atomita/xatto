import { Component } from './Component'
import { Props } from './Props'

export interface VNode {
  children: VNode[];
  key: any;
  name: string | Component | ((name, props, ...rest) => VNode);
  props: any;
}
