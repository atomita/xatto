import { CONTEXT, EXTRA, PATH } from './consts/attributeNames'
import { Props } from './Props'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'

export function remodelProps(props: any, context?: any, extra?: any, path?: string): Props {
  deepSet(props, CONTEXT, context || deepGet(props, CONTEXT) || {})
  deepSet(props, EXTRA, extra || deepGet(props, EXTRA) || {})
  deepSet(props, PATH, path || '')

  return props as Props
}
