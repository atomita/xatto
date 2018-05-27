import { ElementExtends } from './ElementExtends';
export declare function patch(parent: Element, element: Element & ElementExtends, oldNode: any, node: any, lifecycle: Array<() => void>, isSVG: boolean | undefined, eventListener: any): Element & ElementExtends;
