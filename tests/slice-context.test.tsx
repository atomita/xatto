import * as assert from 'power-assert'

import { delay, minify } from './utils'

import { atto } from '../src/atto'
import { x } from '../src/x'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('Slice context', async () => {
  const view = ({ xa: { context }, ...props }, children) => (
    <div>
      <Child />
    </div>
  )

  const Child: any = ({ xa: { context }, ...props }, children) => (
    <div class="child">
      <div>{context.name}</div>
      {context.children && context.children.length && (<Children xa={{ slice: "children" }} />)}
    </div>
  )

  const Children: any = ({ xa: { context }, ...props }, children) => (
    <ul>
      {context && context.length && context.map((_, i) => (<li><Child xa={{ slice: i }} /></li>))}
    </ul>
  )

  const mutate = atto(view, document.body)

  mutate({
    name: "foo",
    children: [
      {
        name: "bar",
        children: [
          {
            name: "bar child"
          }
        ]
      },
      {
        name: "baz",
        children: [
          {
            name: "baz child"
          }
        ]
      }
    ]
  })
  await delay(10)

  const html = minify`
    <div>
      <div class="child">
        <div>foo</div>
        <ul>
          <li>
            <div class="child">
              <div>bar</div>
              <ul>
                <li>
                  <div class="child">
                    <div>bar child</div>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <div class="child">
              <div>baz</div>
              <ul>
                <li>
                  <div class="child">
                    <div>baz child</div>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `

  assert(document.body.innerHTML == html)

})
