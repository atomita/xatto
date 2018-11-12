import { CONTEXT, EXTRA, SLICE } from './consts/attributeNames'
import { Props } from './Props'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'

export function remodelProps(props: any, context?: any, extra?: any): Props {
  deepSet(props, CONTEXT, context || deepGet(props, CONTEXT) || {})
  deepSet(props, EXTRA, extra || deepGet(props, EXTRA) || {})

  return props as Props
}
