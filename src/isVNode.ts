import { CHILDREN, KEY, NAME, PROPS } from './consts/vNodeAttributeNames'
import { VNode } from './VNode'

const OBJECT = 'object'
const STRING = 'string'

const nameTypes = [STRING, 'function']

export function isVNode (value): value is VNode {
  return (
    null != value &&
    OBJECT === typeof value &&
    PROPS in value &&
    CHILDREN in value &&
    KEY in value &&
    NAME in value &&
    OBJECT === typeof value[PROPS] &&
    OBJECT === typeof value[CHILDREN] &&
    'length' in value[CHILDREN] &&
    (value[KEY] == null || STRING === typeof value[KEY]) &&
    0 <= nameTypes.indexOf(typeof value[NAME])
  )
}
