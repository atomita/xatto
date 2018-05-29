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

const down = (event, context) => ({ count: ~~context.count - 1 })
const up = (event, context) => ({ count: ~~context.count + 1 })

const view = ({ 'xa-context': context, ...attrs }, children) => (
  <div>
    <h1>{~~context.count}</h1>
    <button onclick={down}>-</button>
    <button onclick={up}>+</button>
  </div>
)

atto(view, document.getElementById("app"))()
```

https://codepen.io/atomita/pen/PaYmVa
