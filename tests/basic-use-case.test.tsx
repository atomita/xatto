import * as assert from 'power-assert'

import { minify } from './utils'

import { atto } from '../src/atto'
import { x } from '../src/x'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('Basic use case', () => {

  test('Display "foo"', (done) => {
    const view = (props, children) => (<div>foo</div>)

    const mutate = atto(view, document.body)

    mutate({})

    setTimeout(() => {
      assert(document.body.innerHTML == `<div>foo</div>`)

      done()
    }, 10)
  })

  test('Mutate by context', (done) => {
    const view = ({ xa: { context }, ...props }, children) => (<div class={context.clazz}></div>)

    const mutate = atto(view, document.body)

    mutate({ clazz: 'foo' })

    setTimeout(() => {
      assert(document.body.innerHTML == `<div class="foo"></div>`)

      done()
    }, 10)
  })

  test('Multi mutate', (done) => {
    const view = ({ xa: { context }, ...props }, children) => (<div class={context.clazz}></div>)

    const mutate = atto(view, document.body)

    const doneDelay = [
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
    ].reduce((time, { context, html }) => {
      setTimeout(() => mutate(context), time)
      setTimeout(() => assert(document.body.innerHTML == html), time + 10)
      return time + 15
    }, 0)

    setTimeout(done, doneDelay)
  })

  test('Mutate by click event', (done) => {
    const view = ({ xa: { context }, ...props }, children) => (<div onclick={onClick}>{context.count}</div>)

    let eventArgs

    const onClick = (context, detail, props, event) => {
      eventArgs = { context, detail, props, event }
      return { count: context.count + 1 }
    }

    const mutate = atto(view, document.body)

    mutate({ count: 0 })

    setTimeout(() => {
      assert(document.body.innerHTML == `<div>0</div>`)

      const event = new Event('click')
      document.body.children[0].dispatchEvent(event)
    }, 10)

    setTimeout(() => {
      assert(document.body.innerHTML == `<div>1</div>`)
      assert('object' == typeof eventArgs.context)
      assert(0 === eventArgs.context.count)
      assert('object' == typeof eventArgs.detail)
      assert('object' == typeof eventArgs.props)
      assert(onClick === eventArgs.props.onclick)
      assert(eventArgs.event instanceof Event)

      const event = new Event('click')
      document.body.children[0].dispatchEvent(event)
    }, 20)

    setTimeout(() => {
      assert(document.body.innerHTML == `<div>2</div>`)

      done()
    }, 30)
  })
})
