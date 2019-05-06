import * as assert from 'power-assert'

import { delay, minify } from './utils'

import { atto } from '../src/atto'
import { NowaitState } from '../src/nowait'
import { x } from '../src/x'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('nowait', () => {

  test('Display "foo"', async () => {
    const view = ({ xa: { context, extra }, ...props }, children) => {
      const [value, err, state] = extra.nowait(context.query)
      return (<div>{value.message}</div>)
    }

    const mutate = atto(view, document.body)

    mutate({
      query: {
        message: "foo"
      }
    })

    await delay(10)

    assert(document.body.innerHTML == `<div>foo</div>`)
  })

  test('Display "foo", display "bar" after a while, with Promise', async () => {
    const view = ({ xa: { context, extra }, ...props }, children) => {
      const [value, err, state] = extra.nowait(context.query, { message: "foo" })
      return (<div>{value.message}</div>)
    }

    const mutate = atto(view, document.body)

    const query = (async () => {
      await delay(100)
      return { message: "bar" }
    })()

    mutate({ query })

    await delay(10)

    assert(document.body.innerHTML == `<div>foo</div>`)

    await delay(200)

    assert(document.body.innerHTML == `<div>bar</div>`)
  })

  test('Display "foo", display "bar" after a while, and display "baz" after a while, with Observable', async () => {
    const view = ({ xa: { context, extra }, ...props }, children) => {
      const [value, err, state] = extra.nowait(context.query, { message: "foo" })
      return (<div>{value.message}</div>)
    }

    const mutate = atto(view, document.body)

    let next, fail, comp
    const query = {
      subscribe(_next, _fail?, _comp?) {
        [next, fail, comp] = [_next, _fail, _comp]
      }
    }

    mutate({ query })

    await delay(10)

    assert(document.body.innerHTML == `<div>foo</div>`)

    next({ message: "bar" })
    await delay(10)

    assert(document.body.innerHTML == `<div>bar</div>`)

    next({ message: "baz" })
    await delay(10)

    assert(document.body.innerHTML == `<div>baz</div>`)
  })
})
