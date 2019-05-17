import * as assert from 'power-assert'

import { delay, minify } from './utils'

import { atto } from '../src/atto'
import { x } from '../src/x'
import { Component } from '../src/Component';

beforeEach(() => {
  document.body.innerHTML = ''
})

test('Fragments', async () => {
  const view = (
    (props, children) => (
      x(x, {}, [
        (<div>a</div>),
        (<div>b</div>)
      ])
    )

    // @todo TypeScriptがFragmentsに未対応？
    // <>
    //   <div>a</div>
    //   <div>b</div>
    // </>
  ) as Component

  const mutate = atto(view, document.body)

  mutate({})
  await delay(10)

  const html = minify`
    <div>a</div>
    <div>b</div>
  `

  assert(document.body.innerHTML == html)

})
