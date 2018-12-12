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

})
