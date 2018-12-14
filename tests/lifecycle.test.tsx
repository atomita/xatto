import * as assert from 'power-assert'

import { delay, minify } from './utils'

import { atto } from '../src/atto'
import { currentOnly } from '../src/currentOnly'
import { x } from '../src/x'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('Lifecycle', async () => {
  const targets: any = {}
  const htmls: any = {}

  const onRemove = currentOnly(async (context, detail, props, event) => {
    targets.remove = event.currentTarget

    htmls.remove = document.body.innerHTML

    await delay(10)

    detail.done()
  })

  const onCreate = currentOnly(async (context, detail, props, event) => {
    targets.create = event.currentTarget

    htmls.create = document.body.innerHTML

    await delay(10)

    return { clazz: "foo" }
  })

  const onUpdate = currentOnly((context, detail, props, event) => {
    targets.update = event.currentTarget

    htmls.update = document.body.innerHTML

    return { display: false }
  })

  const onDestroy = currentOnly((context, detail, props, event) => {
    targets.destroy = event.currentTarget

    htmls.destroy = document.body.innerHTML

    assert(event.currentTarget === targets.create)
    assert(event.currentTarget === targets.remove)
    assert(event.currentTarget === targets.update)
  })

  const view = ({ xa: { context }, ...props }, children) => (
    <div id="root">
      {context.display && (
        <div
          id="child"
          class={context.clazz}
          oncreate={onCreate}
          onremove={onRemove}
          onupdate={onUpdate}
          ondestroy={onDestroy}
        ></div>
      )}
    </div>
  )

  const mutate = atto(view, document.body)

  mutate({ display: true })

  await delay(100)

  assert("child" == targets.create.id)
  assert(targets.create === targets.destroy)
  assert(targets.create === targets.remove)
  assert(targets.create === targets.update)

  const htmlCreate = minify`
      <div id="root">
        <div id="child"></div>
      </div>
    `
  assert(htmls.create == htmlCreate)

  const htmlUpdate = minify`
      <div id="root">
        <div id="child" class="foo"></div>
      </div>
    `
  assert(htmls.update == htmlUpdate)

  const htmlRemove = minify`
      <div id="root">
        <div id="child" class="foo"></div>
      </div>
    `
  assert(htmls.remove == htmlRemove)
  assert(htmls.destroy == htmlRemove)

  const htmlDestroyed = minify`
      <div id="root">
      </div>
    `
  assert(document.body.innerHTML == htmlDestroyed)
})
