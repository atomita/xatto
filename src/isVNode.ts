import { CHILDREN, KEY, NAME, PROPS } from './consts/vNodeAttributeNames'

export function isVNode(value) {
  return null != value
    && 'object' === typeof value
    && PROPS in value
    && CHILDREN in value
    && KEY in value
    && NAME in value
}
