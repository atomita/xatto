import { ATTRIBUTES, CHILDREN, KEY, NAME } from './consts/vdomAttributeNames'
import { TEXT } from './consts/attributeNames'
import { TEXT_NODE } from './consts/tagNames'
import { VDOM } from './VDOM'
import { deepSet } from './deepSet'
import { isVDOM } from './isVDOM'

export function createVDOM(mayBeTextNode, name, attributes: any = {}, children: VDOM[] = []): VDOM {
  const node: any = {}

  node[NAME] = name
  node[ATTRIBUTES] = attributes
  node[CHILDREN] = children
  node[KEY] = attributes.key

  if (mayBeTextNode && 'function' !== typeof name) {
    node[NAME] = TEXT_NODE
    deepSet(node[ATTRIBUTES], TEXT, name)
  }

  return node as VDOM
}
