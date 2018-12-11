import { DESTROY, REMOVE } from "./consts/lifecycleNames";
import { ELEMENT, LIFECYCLE } from "./consts/glueNodeAttributeNames";
import { GlueNode } from "./GlueNode";
import { PROPS } from "./consts/vNodeAttributeNames";
import { deepGet } from "./deepGet";

const shouldBeCaptureLifecycles = {}
shouldBeCaptureLifecycles[REMOVE] = 1
shouldBeCaptureLifecycles[DESTROY] = 2

export function resolveLifecycle(
  glueNode: GlueNode,
  captureLifecycle: string,
  removedNodes: WeakMap<Node, boolean>
) {
  const rawLifecycle = glueNode[LIFECYCLE]

  const shouldBeCaptureLifecycle = shouldBeCaptureLifecycles[rawLifecycle]
  const shouldBeCaptureLifecycleByCaptured = shouldBeCaptureLifecycles[captureLifecycle]

  const lifecycle = shouldBeCaptureLifecycleByCaptured
    && (!shouldBeCaptureLifecycle || shouldBeCaptureLifecycle < shouldBeCaptureLifecycleByCaptured)
    && captureLifecycle
    || rawLifecycle

  if (REMOVE == lifecycle) {
    const node = glueNode[ELEMENT]!

    return (
      removedNodes.get(node) ||
      (REMOVE == rawLifecycle && !deepGet(glueNode, `${PROPS}.on${REMOVE}`))
    )
      ? DESTROY
      : REMOVE
  }

  return rawLifecycle
}
