import {
  ELEMENT,
  LIFECYCLE,
  PREV_PROPS
} from './consts/glueNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, UPDATE } from './consts/lifecycleNames'
import { CHILDREN, KEY, NAME, PROPS } from './consts/vNodeAttributeNames'
import { createGlueNode } from './createGlueNode'
import { deepGet } from './deepGet'
import { deepSet } from './deepSet'
import { GlueNode } from './GlueNode'
import { ResolvedVNode } from './ResolvedVNode'
import { resolveLifecycle } from './resolveLifecycle'

export function glueNodeMerger (
  removedNodes: WeakMap<Node, boolean>,
  next: Function,
  recursion: Function,
  captureLifecycle: string,
  vNode?: ResolvedVNode,
  glueNode?: GlueNode
): GlueNode {
  if (!glueNode) {
    return createGlueNode(vNode!, next, recursion)
  }

  if (!vNode) {
    deepSet(glueNode, PREV_PROPS, glueNode[PROPS])

    const lifecycle = resolveLifecycle(
      REMOVE != captureLifecycle && DESTROY != captureLifecycle
        ? REMOVE
        : UPDATE,
      captureLifecycle,
      glueNode,
      removedNodes
    )

    glueNode[LIFECYCLE] = lifecycle
    glueNode[CHILDREN] = glueNode[CHILDREN].map((child) =>
      recursion(lifecycle, null, child)
    )
    return glueNode
  }

  deepSet(glueNode, PREV_PROPS, glueNode[PROPS])

  glueNode[PROPS] = vNode[PROPS]
  glueNode[KEY] = vNode[KEY]
  glueNode[NAME] = vNode[NAME]

  glueNode[LIFECYCLE] = UPDATE

  const indexedPrevChildren = glueNode[CHILDREN].map(
    (child, i) => ((child.i = i), child)
  )

  const children = vNode[CHILDREN].map((child) => {
    let prevChild, _prevChild, i
    for (i = 0; i < indexedPrevChildren.length; i++) {
      _prevChild = indexedPrevChildren[i]
      if (
        child[NAME] == _prevChild[NAME] &&
        child[KEY] == _prevChild[KEY] &&
        (UPDATE === _prevChild[LIFECYCLE] || CREATE === _prevChild[LIFECYCLE])
      ) {
        prevChild = _prevChild
        break
      }
    }
    if (prevChild) {
      indexedPrevChildren.splice(i, 1)
      return recursion(UPDATE, child, prevChild)
    } else {
      return recursion(UPDATE, child)
    }
  })

  indexedPrevChildren.map((child) => {
    child = recursion(UPDATE, null, child)
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
