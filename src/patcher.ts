import { assign } from './assign'
import { TEXT } from './consts/attributeNames'
import { LIFECYCLE, NODE, PREV } from './consts/glueNodeAttributeNames'
import { CREATE, DESTROY, REMOVE, UPDATE } from './consts/lifecycleNames'
import { TEXT_NODE } from './consts/tagNames'
import { CHILDREN, NAME } from './consts/vNodeAttributeNames'
import { createNode } from './createNode'
import { deepGet } from './deepGet'
import { fireLifeCycleEventProvider } from './fireLifeCycleEventProvider'
import { GlueNode } from './GlueNode'
import { Props } from './Props'
import { resolveLifecycle } from './resolveLifecycle'
import { updateNode } from './updateNode'

export function patcher (
  mutate: Function,
  destroys: Function[],
  lifecycleEvents: Function[],
  eventProxy: (e: Event) => void,
  eventTargetProps: WeakMap<EventTarget, Props>,
  removedNodes: WeakMap<Node, boolean>,
  next: Function,
  recursion: Function,
  glueNode: GlueNode,
  isSVG: boolean
): GlueNode | null {
  const newGlueNode = assign({}, glueNode)

  let node: Node = glueNode[NODE]!

  if (!isSVG && glueNode[NAME] === 'svg') {
    isSVG = true
  }

  const lifecycle = newGlueNode[LIFECYCLE]!

  let lifecycleEvent
  let detail: any = null

  switch (lifecycle) {
    case CREATE:
      lifecycleEvent = true
      node = createNode(glueNode, isSVG, eventProxy, eventTargetProps)
      break
    case UPDATE:
      [node, lifecycleEvent] = updateNode(
        glueNode,
        isSVG,
        eventProxy,
        eventTargetProps
      )
      break
    case DESTROY:
      lifecycleEvent = true
      destroys.push(() => {
        const parent = node.parentElement || node.parentNode
        parent && parent.removeChild(node)
      })
      break
    case REMOVE:
      if (!removedNodes.has(node)) {
        removedNodes.set(node, false)
        lifecycleEvent = true
        detail = {
          done: () => {
            removedNodes.set(node, true)
            Promise.resolve({}).then(mutate as any)
          }
        }
      }
  }

  if (lifecycleEvent) {
    lifecycleEvents.push(fireLifeCycleEventProvider(node, lifecycle, detail))
  }

  const children = glueNode[CHILDREN].reduce(
    (acc, childNode) => {
      const patchedChild = recursion(childNode, isSVG)
      return patchedChild ? acc.concat(patchedChild) : acc
    },
    [] as GlueNode[]
  )

  if (lifecycle === DESTROY) {
    return null
  }

  children
    .map((v) => v[NODE]!)
    .reduceRight(
      (ref, elm) => {
        if (elm.parentNode !== node
          || elm.nextSibling !== ref) {
          node.insertBefore(elm, ref)
        }
        return elm
      },
      null as any
    )

  newGlueNode[CHILDREN] = children
  newGlueNode[NODE] = node

  return newGlueNode
}
