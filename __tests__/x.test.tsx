import * as assert from 'power-assert'

import { x } from '../src/x'

describe('x function', () => {

  test('response is object', () => {
    assert(typeof x("div", {}, []) == 'object')
    assert(typeof (<div></div>) == 'object')
  })

  test('skip if it null or Boolean in children', () => {
    assert(x("div", {}, [true]).children.length === 0)
    assert(x("div", {}, [false]).children.length === 0)
    assert(x("div", {}, [null]).children.length === 0)

    assert((<div>{true}</div>).children.length === 0)
    assert((<div>{false}</div>).children.length === 0)
    assert((<div>{null}</div>).children.length === 0)
  })

  test("JSX component syntax", () => {
    const Component = (attrs, children) => <div key={attrs.key}>{children}</div>

    assert.deepEqual((<Component key="key">foo</Component>), {
      attributes: { key: "key" },
      children: [
        {
          attributes: {
            xa: {
              text: "foo"
            }
          },
          children: [],
          key: undefined,
          name: "xa-txt",
        }
      ],
      key: "key",
      name: Component,
    })
  })

})
