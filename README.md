# xatto
xatto is a JavaScript framework for building web applications like Hyperapp.

## Getting Started

xatto is available as a package on [npm](https://www.npmjs.com/). 

```
npm install xatto
```

```js
import { x, atto } from "xatto"
```

It is also available on a [CDN](https://unpkg.com).

```html
<script src="https://unpkg.com/xatto"></script>
<script>
  var x = window.xatto.x;
  var atto = window.xatto.atto;
  // ...
</script>
```

## Examples

### A counter that can be incremented or decremented

```jsx
// @jsx x
import { x, atto } from "xatto"

const down = (context, value) => ({ count: ~~context.count - value })
const up = (context, value) => ({ count: ~~context.count + value })

const view = ({ xaContext, ...attrs }, children) => (
  <div>
    <h1>{~~xaContext.count}</h1>
    <button onclick={(event, context) => down(context, 1)}>-</button>
    <button onclick={(event, context) => up(context, 1)}>+</button>
  </div>
)

atto(view, document.getElementById("app"))()
```

https://codepen.io/atomita/pen/PaYmVa
