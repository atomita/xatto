import { Props } from './Props'
import { VNode } from './VNode'

export type Component = (props: Props, children: VNode[]) => VNode | undefined
