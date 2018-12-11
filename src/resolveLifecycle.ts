import { ELEMENT, LIFECYCLE } from './consts/glueNodeAttributeNames'
import { DESTROY, REMOVE } from './consts/lifecycleNames'
import { PROPS } from './consts/vNodeAttributeNames'
import { deepGet } from './deepGet'
import { GlueNode } from './GlueNode'

const shouldBeCaptureLifecycles = {}
shouldBeCaptureLifecycles[REMOVE] = 1
shouldBeCaptureLifecycles[DESTROY] = 2

export function resolveLifecycle (
  rawLifecycle: string,
  captureLifecycle: string,
  glueNode: GlueNode,
  removedNodes: WeakMap<Node, boolean>
) {
  const shouldBeCaptureLifecycle = shouldBeCaptureLifecycles[rawLifecycle]
  const shouldBeCaptureLifecycleByCaptured =
    shouldBeCaptureLifecycles[captureLifecycle]

  const lifecycle =
    (shouldBeCaptureLifecycleByCaptured &&
      (!shouldBeCaptureLifecycle ||
        shouldBeCaptureLifecycle < shouldBeCaptureLifecycleByCaptured) &&
      captureLifecycle) ||
    rawLifecycle

  if (REMOVE == lifecycle) {
    const node = glueNode[ELEMENT]!

    return removedNodes.get(node) ||
      (REMOVE == rawLifecycle && !deepGet(glueNode, `${PROPS}.on${REMOVE}`))
      ? DESTROY
      : REMOVE
  }

  return lifecycle
}
