import { ATTRIBUTES, CHILDREN, KEY, NAME } from './consts/vNodeAttributeNames'

export function isVNode(value) {
  return null != value
    && 'object' === typeof value
    && ATTRIBUTES in value
    && CHILDREN in value
    && KEY in value
    && NAME in value
    && 4 === Object.keys(value).length
}
