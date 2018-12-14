import { Props } from './Props'

export interface ResolvedVNode {
  children: ResolvedVNode[]
  key: any
  name: string
  props: Props
}
