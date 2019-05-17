// import { Props } from './Props'
import { VNode } from './VNode'

export type Component = (
  props?: any /* Props */,
  children?: VNode[],
  context?,
  extra?
) => VNode | undefined | null | true | false
