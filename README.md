# xatto
xatto is View Layer Library based on Function and Context using VirtualDOM.  
This is developed by forking from [jorgebucaran/superfine](https://github.com/jorgebucaran/superfine).

## Getting Started

> Note: The example in this document assumes that you are using a JavaScript compiler such as [Babel](https://babeljs.io/) or [TypeScript](https://www.typescriptlang.org/), a JSX (TSX) transpiler, and a module bundle such as [Parcel](https://parceljs.org/), [Webpack](https://webpack.js.org/).


The main APIs of `xatto` are two.  
The first one is `xatto.x`. It returns a new virtual DOM node tree.  
The other is `xatto.atto`. It returns a function that mount (or update) a component in the specified DOM element. (`mutate` function)


example: A counter that can be incremented or decremented.

```jsx
import { x, atto } from "xatto"

const down = context => ({ count: context.count - 1 })
const up = context => ({ count: context.count + 1 })

const Component = (props, children, context) => (
  <div>
    <h1>{context.count}</h1>
    <button onclick={down}>-</button>
    <button onclick={up}>+</button>
  </div>
)

atto(Component, document.getElementById("app"))({
  count: 10
})
```


## Installation

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

## Overview

### Context

A context is a JavaScript object that describes a component.  
It consists of dynamic data that moves within a component during execution.  
To change the context you need to use the mutate function (or event handler in the components).

### Mutate function

It is a function returned by `xatto.atto`.

Passing the context mount the component specified by xatto.atto on the specified container together.  
From the second time on, it update.

### Components

The component returns the specification in the form of a plain JavaScript object called virtual DOM, and xatto is updates the actual DOM accordingly.  
Each time the context changes the component is invoked so you can specify the appearance of the DOM based on the new context.

The context can be referenced in the third arguments.

```jsx
import { x, atto } from "xatto"

const Component = (props, children, context) => (
  <div>{context.name}</div>
)

atto(Component, document.getElementById("app"))({
  name: "foo"
})
```

**Fragments supported**

```jsx
const Component = (props, children) => (
  <>
    <div>foo</div>
    <div>bar</div>
  </>
)
```

#### Sliced context and fill

The child component can treat a part of the context as if it were the root context by using `<Context slice="path">` in the parent component.

Also, the `fill` attribute can specify a value to use if part of the sliced context is undefined.

```jsx
import { x, atto, Context } from "xatto"

const Parent = (props, children, context) => (
  <div>
    <span>{context.name}</span>
    <ul>
      <li><Context slice="children.0"><Child /></Context></li>
      <li><Context slice="children.1" fill={{ name: "baz" }}><Child /></Context></li>
    </ul>
  </div>
)

const Child = (props, children, context) => (
  <span>{context.name}</span>
)

atto(Parent, document.getElementById("app"))({
  name: "foo",
  children: [
    {
      name: "bar"
    }
  ]
})
```


### Events

Event handlers are wrapped by xatto.  
Usually, the event object passed in the first argument is the fourth argument.  
The return value is passed to the mutate function.

Event handler arguments:

1. context
2. `{ ...extra, ...detail, dispatch }`
    - `detail` is [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
    - `dispatch` is function for dispatch a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
3. props
4. [event](https://developer.mozilla.org/en-US/docs/Web/API/Event)


#### Lifecycle Events

Lifecycle events can be used to be notified when an element managed by the virtual DOM is created, updated, or deleted.  
It can be used for animation, data fetching, third party library wrapping, resource cleanup, etc.

##### oncreate
This event occurs after an element is created and attached to the DOM.

##### onupdate
This event will occur each time you update an element's attributes.

##### onremove
This event occurs before an element is dettached from the DOM.  
`detail.done` is passed a function to detach the element.

##### ondestroy
This event occurs just before an element is dettached from the DOM.

##### onlifecycle
This event occurs just before each life cycle event occurs.  
`detail.type` is passed the life cycle event name.


### Keys

The key helps to identify the node each time xatto update the DOM.  
This allows you to rearrange the elements to a new position if you change the position.

The key must be unique among sibling nodes.


### Extra
If you want to pass values from the parent component to all descendant components, try using `Extra`.
You can refer to the same value regardless of `context`.

```jsx
import { x, atto, Context, Extra } from "xatto"

const Parent = (props, children, context) => (
  <div>
    <span>{context.name}</span>
    <Extra parentName={context.name}>
      <ul>
        <li><Context slice="children.0"><Child /></Context></li>
        <li><Context slice="children.1" fill={{ name: "baz" }}><Child /></Context></li>
      </ul>
    </Extra>
  </div>
)

const Child = (props, children, context, extra) => (
  <div>
    <p>{extra.parentName + ' - ' + context.name}</p>
    {context.children && context.children.map((child, i) => (
      <Context slice={'children.' + i}>
        <Grandchild />
      </Context>
    ))}
  </div>
)

const Grandchild = (props, children, context, extra) => (
  <p>{extra.parentName + ' - ' + context.name}</p>
)

atto(Parent, document.getElementById("app"))({
  name: "foo",
  children: [
    {
      name: "bar",
      children: [
        {
          name: "barbaz"
        }
      ]
    }
  ]
})
```


## Polyfill which may be needed

- [Promise](https://caniuse.com/#search=promise)
  - [es6-promise - npm](https://www.npmjs.com/package/es6-promise)
- [CustomEvent](https://caniuse.com/#feat=customevent)
  - [custom-event-polyfill - npm](https://www.npmjs.com/package/custom-event-polyfill)
- [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap#Browser_compatibility)
  - [weakmap-polyfill - npm](https://www.npmjs.com/package/weakmap-polyfill)

## License

xatto is MIT licensed. See [LICENSE](LICENSE.md).

## Other examples

### The counters.

```jsx
import { x, atto, Context } from "xatto"

const down = context => ({ count: context.count - 1 })
const up = context => ({ count: context.count + 1 })

const Counter = (props, children, context) => (
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

const Main = (props, children, context) => (
  <div>
    <button onclick={add}>add</button>
    <button onclick={cut}>cut</button>

    {context.counters
      .map((v, i) => (<Context slice={'counters.' + i}><Counter /></Context>))}

    <pre>{JSON.stringify(context, null, '  ')}</pre>
  </div>
)

atto(Main, document.getElementById("app"))({
  counters: [
    { count: 0 },
    { count: 10 }
  ]
})
```

https://codepen.io/atomita/pen/OaLxwP
