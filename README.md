# xatto
xatto is View Layer Library based on Function and Context using VirtualDOM.  
This is developed by forking from [jorgebucaran/superfine](https://github.com/jorgebucaran/superfine).

## Get Started

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

### Easier

```sh
git clone https://github.com/atomita/xatto-starter-kit.git project
cd project
npm install
npm run serve
```

## Examples

### A counter that can be incremented or decremented.

```jsx
// @jsx x
import { x, atto } from "xatto"

const down = context => ({ count: context.count - 1 })
const up = context => ({ count: context.count + 1 })

const view = ({ xa: { context }, ...attrs }, children) => (
  <div>
    <h1>{context.count}</h1>
    <button onclick={down}>-</button>
    <button onclick={up}>+</button>
  </div>
)

atto(view, document.getElementById("app"))({
  count: 10
})
```



### The counters.

```jsx
// @jsx x
import { x, atto } from "xatto"

const down = context => ({ count: context.count - 1 })
const up = context => ({ count: context.count + 1 })

const Counter = ({ xa: { context }, ...attrs }, children) => (
  <div>
    <h1>{context.count}</h1>
    <button onclick={down}>-</button>
    <button onclick={up}>+</button>
  </div>
)

const add = context => ({
  counters: context.counters.concat({count: 0})
})

const cut = context => ({
  counters: context.counters.slice(0, -1)
})

const view = ({ xa: { context }, ...attrs }, children) => (
  <div>
    <button onclick={add}>add</button>
    <button onclick={cut}>cut</button>

    {context.counters.map((v, i) => (<Counter xa={{ slice: "counters." + i }} />))}

    <pre>{JSON.stringify(context, null, '  ')}</pre>
  </div>
)

atto(view, document.getElementById("app"))({
  counters: [
    { count: 0 },
    { count: 10 }
  ]
})
```

https://codepen.io/atomita/pen/OaLxwP
