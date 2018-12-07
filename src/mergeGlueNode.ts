import { CHILDREN, KEY, NAME, PROPS } from './consts/vNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, REMOVING, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV_PROPS } from './consts/glueNodeAttributeNames'
import { GlueNode } from './GlueNode';
import { ResolvedVNode } from './ResolvedVNode';
import { createGlueNode } from './createGlueNode'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'

export function mergeGlueNode(
  vNode?: ResolvedVNode,
  glueNode?: GlueNode
): GlueNode {

  if (!glueNode) {
    return createGlueNode(vNode!)
  }

  if (!vNode) {
    deepSet(glueNode, PREV_PROPS, glueNode[PROPS])
    glueNode[LIFECYCLE] = (glueNode[LIFECYCLE] === REMOVING || glueNode[LIFECYCLE] === DESTROY)
      ? glueNode[LIFECYCLE]
      : (deepGet(glueNode, `${PROPS}.on${REMOVE}`)
        ? REMOVE
        : DESTROY)
    return glueNode
  }

  deepSet(glueNode, PREV_PROPS, glueNode[PROPS])

  glueNode[PROPS] = vNode[PROPS]
  glueNode[KEY] = vNode[KEY]
  glueNode[NAME] = vNode[NAME]

  glueNode[LIFECYCLE] = UPDATE

  const indexedPrevChildren = glueNode[CHILDREN].map((child, i) => (child.i = i, child))

  const children = vNode[CHILDREN].map(child => {
    let prevChild, _prevChild, i
    for (i = 0; i < indexedPrevChildren.length; i++) {
      _prevChild = indexedPrevChildren[i]
      if (child[NAME] == _prevChild[NAME]
        && child[KEY] == _prevChild[KEY]
        && (UPDATE === _prevChild[LIFECYCLE] || CREATE === _prevChild[LIFECYCLE])) {
        prevChild = _prevChild
        break
      }
    }
    if (prevChild) {
      indexedPrevChildren.splice(i, 1)
      return mergeGlueNode(child, prevChild)
    } else {
      return mergeGlueNode(child)
    }
  })

  indexedPrevChildren.map((child) => {
    child = mergeGlueNode(undefined, child)
    if (0 === child.i) {
      children.unshift(child)
    } else {
      const index = child.i - 1
      let i
      for (i = 0; i < children.length; i++) {
        if (index === children[i].i) {
          children.splice(i + 1, 0, child)
          return
        }
      }
      children.push(child)
    }
  })

  glueNode[CHILDREN] = children

  return glueNode
}
