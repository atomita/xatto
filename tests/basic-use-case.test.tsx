import * as assert from 'power-assert'

import { delay, minify } from './utils'

import { atto } from '../src/atto'
import { x } from '../src/x'
import { Component } from '../src/Component';

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('Basic use case', () => {

  test('Display "foo"', async () => {
    const view = (props, children) => (<div>foo</div>)

    const mutate = atto(view, document.body)

    mutate({})

    await delay(10)

    assert(document.body.innerHTML == `<div>foo</div>`)
  })

  test('Mutate by context', async () => {
    const view = ((props, children, context) => (<div class={context.clazz}></div>)) as Component

    const mutate = atto(view, document.body)

    mutate({ clazz: 'foo' })

    await delay(10)

    assert(document.body.innerHTML == `<div class="foo"></div>`)
  })

  test('Multi mutate', async () => {
    const view = ((props, children, context) => (<div class={context.clazz}></div>)) as Component

    const mutate = atto(view, document.body)

    for (const data of [
      {
        context: { clazz: null },
        html: `<div></div>`
      },
      {
        context: { clazz: '' },
        html: `<div class=""></div>`
      },
      {
        context: { clazz: 'foo' },
        html: `<div class="foo"></div>`
      },
      {
        context: { clazz: false },
        html: `<div></div>`
      }
    ]) {
      mutate(data.context)

      await delay(10)

      assert(document.body.innerHTML == data.html)
    }
  })

  test('Mutate by click event', async () => {
    const view = ((props, children, context) => (<div onclick={onClick}>{context.count}</div>)) as Component

    let eventArgs

    const onClick = (context, detail, props, event) => {
      eventArgs = { context, detail, props, event }
      return { count: context.count + 1 }
    }

    const mutate = atto(view, document.body)

    mutate({ count: 0 })
    await delay(10)

    assert(document.body.innerHTML == `<div>0</div>`)

    document.body.children[0].dispatchEvent(new Event('click'))
    await delay(10)

    assert(document.body.innerHTML == `<div>1</div>`)
    assert('object' == typeof eventArgs.context)
    assert(0 === eventArgs.context.count)
    assert('object' == typeof eventArgs.detail)
    assert('object' == typeof eventArgs.props)
    assert(onClick === eventArgs.props.onclick)
    assert(eventArgs.event instanceof Event)

    document.body.children[0].dispatchEvent(new Event('click'))
    await delay(10)

    assert(document.body.innerHTML == `<div>2</div>`)
  })
})
