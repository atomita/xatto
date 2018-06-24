import { ATTRIBUTES, CHILDREN, KEY, NAME } from './consts/vNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, REMOVING, UPDATE } from './consts/lifecycleNames'
import { ELEMENT, LIFECYCLE, PREV_ATTRIBUTES } from './consts/glueNodeAttributeNames'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { lifeCycleEventPath } from './lifeCycleEventPath'

export function mergeGlueNode(vNode?, glueNode?) {
  let newGlueNode

  if (!glueNode) {
    newGlueNode = { ...vNode }
    newGlueNode[LIFECYCLE] = CREATE
    newGlueNode[CHILDREN] = vNode[CHILDREN].map(child => mergeGlueNode(child, null))
    deepSet(newGlueNode, PREV_ATTRIBUTES, {})
    return newGlueNode
  }

  if (!vNode) {
    deepSet(glueNode, PREV_ATTRIBUTES, glueNode[ATTRIBUTES])
    glueNode[LIFECYCLE] = (glueNode[LIFECYCLE] === REMOVING || glueNode[LIFECYCLE] === DESTROY)
      ? glueNode[LIFECYCLE]
      : (deepGet(glueNode, lifeCycleEventPath(REMOVE))
        ? REMOVE
        : DESTROY)
    return glueNode
  }

  deepSet(glueNode, PREV_ATTRIBUTES, glueNode[ATTRIBUTES])

  glueNode[ATTRIBUTES] = vNode[ATTRIBUTES]
  glueNode[KEY] = vNode[KEY]
  glueNode[NAME] = vNode[NAME]

  glueNode[LIFECYCLE] = UPDATE

  const indexedPrevChildren = glueNode[CHILDREN].map((child, i) => (child.i = i, child))

  const children = vNode[CHILDREN].map(child => {
    let prevChild, _prevChild, i
    for (i = 0; i < indexedPrevChildren.length; i++) {
      _prevChild = indexedPrevChildren[i]
      if (child[NAME] == _prevChild[NAME] && child[KEY] == _prevChild[KEY]) {
        prevChild = _prevChild
        break
      }
    }
    if (prevChild) {
      indexedPrevChildren.splice(i, 1)
      return mergeGlueNode(child, prevChild)
    } else {
      return mergeGlueNode(child, null)
    }
  })

  indexedPrevChildren.reduceRight((_, child) => {
    child = mergeGlueNode(null, child)
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
  }, 0)

  glueNode[CHILDREN] = children

  return glueNode
}
