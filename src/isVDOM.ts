import { ATTRIBUTES, CHILDREN, KEY, NAME } from './consts/vdomAttributeNames'

export function isVDOM(value) {
  return 'object' === typeof value
    && ATTRIBUTES in value
    && CHILDREN in value
    && KEY in value
    && NAME in value
    && 4 === Object.keys(value).length
}
