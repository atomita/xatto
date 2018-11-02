import { CONTEXT, EXTRA, SLICE } from './consts/attributeNames'
import { Props } from './Props'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'

export function remodelProps(props: any, context?: any, extra?: any, slice?: any[]): Props {
  deepSet(props, CONTEXT, context || deepGet(props, CONTEXT) || {})
  deepSet(props, EXTRA, extra || deepGet(props, EXTRA) || {})
  deepSet(props, SLICE, slice || deepGet(props, SLICE) || [])

  return props as Props
}
