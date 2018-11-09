import { Props } from './Props'
import { VNode } from './VNode'

export interface Component {
  (props: Props, children: VNode[]): VNode | undefined;
}
