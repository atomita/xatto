/*
xatto v0.1.16
https://github.com/atomita/xatto
Released under the MIT License.
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.xatto = {})));
}(this, (function (exports) { 'use strict';

  var CONTEXT = 'xa.context';
  var EXTRA = 'xa.extra';
  var FILL = 'xa.fill';
  var PATH = 'xa.path';
  var SLICE = 'xa.slice';
  var TEXT = 'xa.text';

  var MIDDLEWARES = 'middlewares';

  var CHILDREN = 'children';
  var KEY = 'key';
  var NAME = 'name';
  var PROPS = 'props';

  function assign(target, source) {
      for (var key in source) {
          if (source.hasOwnProperty(key)) {
              target[key] = source[key];
          }
      }
      return target;
  }

  var ELEMENT = 'element';
  var LIFECYCLE = 'lifecycle';
  var PREV = 'prev';
  var PREV_PROPS = PREV + "." + PROPS;

  var CREATE = 'create';
  var DESTROY = 'destroy';
  var REMOVE = 'remove';
  var REMOVING = 'removing';
  var UPDATE = 'update';

  /**
   * Set an object item to a given value using separator notation.
   *
   * @param {any} target
   * @param {string} key
   * @param {any} value
   * @param {string} separator
   * @return {boolean}
   */
  function deepSet(target, key, value, separator) {
      if (separator === void 0) { separator = '.'; }
      while (true) {
          if ('object' !== typeof target) {
              return false;
          }
          var idx = key.indexOf(separator);
          if (idx < 0) {
              target[key] = value;
              return true;
          }
          var current = key.slice(0, idx);
          var nexts = key.slice(idx + 1);
          if (null == target[current]) {
              var next = nexts.split(separator, 1)[0];
              target[current] = next === "" + parseInt(next, 10) ? [] : {};
          }
          target = target[current];
          key = nexts;
      }
  }

  function createGlueNode(vNode) {
      var newGlueNode = assign({}, vNode);
      newGlueNode.i = 0;
      newGlueNode[LIFECYCLE] = CREATE;
      newGlueNode[CHILDREN] = vNode[CHILDREN].map(function (child) { return createGlueNode(child); });
      deepSet(newGlueNode, PREV_PROPS, {});
      return newGlueNode;
  }

  var TEXT_NODE = 'xa-txt';

  function createVNode(mayBeTextNode, name, props, children) {
      if (props === void 0) { props = {}; }
      if (children === void 0) { children = []; }
      var node = {};
      node[NAME] = name;
      node[PROPS] = props;
      node[CHILDREN] = children;
      node[KEY] = props.key;
      if (mayBeTextNode && 'function' !== typeof name) {
          node[NAME] = TEXT_NODE;
          deepSet(node[PROPS], TEXT, name);
      }
      return node;
  }

  function createGlueNodeByElement(element) {
      var node = createGlueNode(createVNode(false, element.nodeName));
      node[ELEMENT] = element;
      return node;
  }

  /**
   * Get an item from an object using separator notation.
   *
   * @typeparam {T}
   * @param {any} target
   * @param {string} key
   * @param {string} separator
   * @return {T}
   */
  function deepGet(target, key, separator) {
      if (separator === void 0) { separator = '.'; }
      while (true) {
          if (target == null) {
              return target;
          }
          var idx = key.indexOf(separator);
          if (idx < 0) {
              return target[key];
          }
          target = target[key.slice(0, idx)];
          key = key.slice(idx + 1);
      }
  }

  function remodelProps(props, context, extra, path) {
      deepSet(props, CONTEXT, context || deepGet(props, CONTEXT) || {});
      deepSet(props, EXTRA, extra || deepGet(props, EXTRA) || {});
      deepSet(props, PATH, path || '');
      return props;
  }

  function apply(fn, args) {
      return fn.apply(null, args);
  }

  function partial(fn, args) {
      return function () {
          var backwardArgs = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              backwardArgs[_i] = arguments[_i];
          }
          return apply(fn, args.concat(backwardArgs));
      };
  }

  var XLINK_NS = "http://www.w3.org/1999/xlink";

  function updateAttribute(element, name, value, oldValue, isSVG, eventProxy, elementProps) {
      if (name === "key" || 'object' === typeof value) {
          // noop
      }
      else {
          if (name[0] === "o" && name[1] === "n") {
              var eventName = name.slice(2);
              if (value == null) {
                  element.removeEventListener(eventName, eventProxy);
              }
              else if (oldValue == null) {
                  element.addEventListener(eventName, eventProxy);
              }
          }
          else {
              var nullOrFalse = value == null || value === false;
              if (name in element &&
                  name !== "list" &&
                  name !== "draggable" &&
                  name !== "spellcheck" &&
                  name !== "translate" &&
                  !isSVG) {
                  if (nullOrFalse) {
                      element.removeAttribute(name);
                  }
                  else {
                      element[name] = value == null ? "" : value;
                  }
              }
              else {
                  var ns = false;
                  if (isSVG) {
                      var originName = name;
                      name = name.replace(/^xlink:?/, "");
                      ns = name !== originName;
                  }
                  switch ((nullOrFalse ? 1 : 0) + ((ns ? 1 : 0) << 1)) {
                      case 0:
                          element.setAttribute(name, value);
                          break;
                      case 1:
                          element.removeAttribute(name);
                          break;
                      case 2:
                          element.setAttributeNS(XLINK_NS, name, value);
                          break;
                      case 3:
                          element.removeAttributeNS(XLINK_NS, name);
                  }
              }
          }
      }
  }

  function createElement(node, isSVG, eventProxy, elementProps) {
      var props = node[PROPS] || {};
      if (node[NAME] === TEXT_NODE) {
          return document.createTextNode(deepGet(props, TEXT));
      }
      var element = (isSVG = isSVG || node[NAME] === "svg")
          ? document.createElementNS("http://www.w3.org/2000/svg", node[NAME])
          : document.createElement(node[NAME]);
      for (var name_1 in props) {
          updateAttribute(element, name_1, props[name_1], null, isSVG, eventProxy, elementProps);
      }
      elementProps.set(element, props);
      return element;
  }

  function provideFireLifeCycleEvent(elm, eventName, option) {
      if (option === void 0) { option = {}; }
      var event = new CustomEvent(eventName, option);
      return function () { return elm.dispatchEvent(event); };
  }

  function updateElement(node, isSVG, eventProxy, elementProps) {
      var element = node[ELEMENT];
      var props = node[PROPS];
      var prevProps = deepGet(node, PREV_PROPS) || {};
      var updated = false;
      if (node[NAME] === TEXT_NODE) {
          var value = deepGet(props, TEXT);
          var oldValue = deepGet(prevProps, TEXT);
          updated = value != oldValue;
          if (updated) {
              element.nodeValue = deepGet(props, TEXT);
          }
          return [element, updated];
      }
      for (var name_1 in props) {
          if (props[name_1] !==
              (name_1 === "value" || name_1 === "checked"
                  ? element[name_1]
                  : prevProps[name_1])) {
              updateAttribute(element, name_1, props[name_1], prevProps[name_1], isSVG, eventProxy, elementProps);
              updated = true;
          }
      }
      elementProps.set(element, props);
      return [element, updated];
  }

  function patch(mutate, destroys, lifecycleEvents, next, recursion, glueNode, isSVG, eventProxy, elementProps, isDestroy) {
      var _a;
      var element = glueNode[ELEMENT];
      if (!isSVG && glueNode[NAME] === 'svg') {
          isSVG = true;
      }
      if (!isDestroy && glueNode[LIFECYCLE] === DESTROY) {
          isDestroy = true;
      }
      var lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE];
      var lifecycleEvent;
      var detail = null;
      switch (lifecycle) {
          case CREATE:
              element = createElement(glueNode, isSVG, eventProxy, elementProps);
              break;
          case UPDATE:
              _a = updateElement(glueNode, isSVG, eventProxy, elementProps), element = _a[0], lifecycleEvent = _a[1];
              break;
          case DESTROY:
              if (glueNode[LIFECYCLE] === DESTROY) {
                  destroys.push(function () { return element.parentElement.removeChild(element); });
              }
              break;
          case REMOVE:
              glueNode[LIFECYCLE] = REMOVING;
              detail = {
                  done: function () {
                      glueNode[LIFECYCLE] = DESTROY;
                      Promise.resolve({}).then(mutate);
                  }
              };
      }
      switch (lifecycle) {
          case CREATE:
          case DESTROY:
          case REMOVE:
              lifecycleEvent = true;
      }
      if (lifecycleEvent && element instanceof Element) {
          lifecycleEvents.push(provideFireLifeCycleEvent(element, lifecycle.toLowerCase(), { detail: detail }));
      }
      var children = glueNode[CHILDREN].reduce(function (acc, childNode) {
          var patchedChild = recursion(childNode, isSVG, eventProxy, elementProps, isDestroy);
          return patchedChild ? acc.concat(patchedChild) : acc;
      }, []);
      if (lifecycle === DESTROY) {
          return null;
      }
      children.map(function (v) { return v.element; }).reduceRight(function (ref, elm) {
          element.insertBefore(elm, ref);
          return elm;
      }, null);
      glueNode[CHILDREN] = children;
      glueNode[ELEMENT] = element;
      return glueNode;
  }

  function isVNode(value) {
      return null != value
          && 'object' === typeof value
          && PROPS in value
          && CHILDREN in value
          && KEY in value
          && NAME in value
          && 4 === Object.keys(value).length;
  }

  function x(name, props) {
      var rest = [];
      for (var _i = 2; _i < arguments.length; _i++) {
          rest[_i - 2] = arguments[_i];
      }
      var children = [];
      while (rest.length) {
          var node = rest.pop();
          if (node && Array.isArray(node)) {
              rest = rest.concat(node);
          }
          else if (node != null && node !== true && node !== false) {
              children.unshift(isVNode(node) && node || createVNode(true, node));
          }
      }
      return createVNode(false, name, props || {}, children);
  }

  function resolveChildren(next, recursion, rootContext, children, parentNode) {
      return children.reduce(function (childs, child) {
          childs.push.apply(childs, recursion(rootContext, child, parentNode));
          return childs;
      }, []);
  }
  function resolveNode(next, recursion, rootContext, node, parentNode) {
      if (!node) {
          return [];
      }
      if (x === node.name) { // Fragment
          return resolveChildren(next, recursion, rootContext, node[CHILDREN], parentNode);
      }
      var rawProps = node[PROPS];
      var parentProps = parentNode && parentNode[PROPS] || {};
      var path = deepGet(rawProps, PATH);
      if (!path) {
          var parentPath = deepGet(parentProps, PATH) || '';
          var slice = deepGet(rawProps, SLICE);
          path = (parentPath && slice)
              ? parentPath + "." + slice
              : (slice || parentPath);
      }
      var sliced = path ? deepGet(rootContext, path) : rootContext;
      if (!sliced) {
          var fill = deepGet(rawProps, FILL) || {};
          sliced = assign({}, fill);
          deepSet(rootContext, path, sliced);
      }
      var context = sliced;
      var extra = assign(assign({}, deepGet(rawProps, EXTRA) || {}), parentNode && deepGet(parentNode, PROPS + "." + EXTRA) || {});
      var props = remodelProps(rawProps, context, extra, path);
      var resolveds = (typeof node.name === "function"
          ? recursion(rootContext, node.name(props, node[CHILDREN]), node)
          : [node]).reduce(function (acc, resolved) {
          if (isVNode(resolved)) {
              resolved[CHILDREN] = resolveChildren(next, recursion, rootContext, resolved[CHILDREN], resolved);
              acc.push(resolved);
          }
          return acc;
      }, []);
      return resolveds;
  }

  function rendererProvider(mutate /* , elementProps, context, view, glueNode */) {
      return function () {
          var destroys = [];
          var lifecycleEvents = [];
          return [
              // resolver
              function (next, recursion) { return partial(resolveNode, [next, recursion]); },
              // pather
              function (next, recursion) { return partial(patch, [mutate, destroys, lifecycleEvents, next, recursion]); },
              // finallyer
              function (next) { return function () {
                  lifecycleEvents.reduceRight(function (_, lifecycleEvent) { return lifecycleEvent(); }, 0);
                  destroys.reduceRight(function (_, destroy) { return destroy(); }, 0);
                  next();
              }; },
          ];
      };
  }

  var lifeCycleEventPath = function (name) { return PROPS + ".on" + name; };

  function mergeGlueNode(vNode, glueNode) {
      if (!glueNode) {
          return createGlueNode(vNode);
      }
      if (!vNode) {
          deepSet(glueNode, PREV_PROPS, glueNode[PROPS]);
          glueNode[LIFECYCLE] = (glueNode[LIFECYCLE] === REMOVING || glueNode[LIFECYCLE] === DESTROY)
              ? glueNode[LIFECYCLE]
              : (deepGet(glueNode, lifeCycleEventPath(REMOVE))
                  ? REMOVE
                  : DESTROY);
          return glueNode;
      }
      deepSet(glueNode, PREV_PROPS, glueNode[PROPS]);
      glueNode[PROPS] = vNode[PROPS];
      glueNode[KEY] = vNode[KEY];
      glueNode[NAME] = vNode[NAME];
      glueNode[LIFECYCLE] = UPDATE;
      var indexedPrevChildren = glueNode[CHILDREN].map(function (child, i) { return (child.i = i, child); });
      var children = vNode[CHILDREN].map(function (child) {
          var prevChild, _prevChild, i;
          for (i = 0; i < indexedPrevChildren.length; i++) {
              _prevChild = indexedPrevChildren[i];
              if (child[NAME] == _prevChild[NAME]
                  && child[KEY] == _prevChild[KEY]
                  && (UPDATE === _prevChild[LIFECYCLE] || CREATE === _prevChild[LIFECYCLE])) {
                  prevChild = _prevChild;
                  break;
              }
          }
          if (prevChild) {
              indexedPrevChildren.splice(i, 1);
              return mergeGlueNode(child, prevChild);
          }
          else {
              return mergeGlueNode(child);
          }
      });
      indexedPrevChildren.reduceRight(function (_, child) {
          child = mergeGlueNode(undefined, child);
          if (0 === child.i) {
              children.unshift(child);
          }
          else {
              var index = child.i - 1;
              var i = void 0;
              for (i = 0; i < children.length; i++) {
                  if (index === children[i].i) {
                      children.splice(i + 1, 0, child);
                      return 0;
                  }
              }
              children.push(child);
          }
          return 0;
      }, 0);
      glueNode[CHILDREN] = children;
      return glueNode;
  }

  function rendering(glueNode, view, rootContext, eventProxy, elementProps, renderers) {
      var rootProps = remodelProps(glueNode[PROPS]);
      var resolverRecursion = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return resolver.apply(null, args);
      };
      var resolver = renderers.map(function (v) { return v[0]; }).reduce(wrapOnion, [noop, resolverRecursion])[0];
      var patcherRecursion = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return patcher.apply(null, args);
      };
      var patcher = renderers.map(function (v) { return v[1]; }).reduce(wrapOnion, [noop, patcherRecursion])[0];
      var finallyer = renderers.map(function (v) { return v[2]; }).reduce(wrapOnion, [noop, noop])[0];
      var vNode = resolver(rootContext, x(view, rootProps, []))[0];
      var node = mergeGlueNode(vNode, glueNode);
      glueNode = patcher(node, 'svg' === node.name, eventProxy, elementProps, false);
      finallyer();
      return glueNode;
  }
  function wrapOnion(_a, stack) {
      var next = _a[0], recursion = _a[1];
      return [stack ? stack(next, recursion) : next, recursion];
  }
  function noop() { }

  function atto(view, elementOrGlueNode, options) {
      if (options === void 0) { options = {}; }
      var scheduled = false;
      var glueNode = elementOrGlueNode instanceof Element
          ? createGlueNodeByElement(elementOrGlueNode)
          : elementOrGlueNode;
      var rootProps = remodelProps(glueNode[PROPS]);
      var rootContext = deepGet(rootProps, CONTEXT);
      var elementProps = new WeakMap();
      var middlewares = MIDDLEWARES in options && options[MIDDLEWARES] || [];
      var rendererProviders = [rendererProvider]
          .concat(middlewares)
          .map(function (provider) { return provider(mutate, elementProps, rootContext, view, glueNode); });
      function mutate(context, path) {
          if (path === void 0) { path = ''; }
          if (context) {
              if (context instanceof Promise) {
                  return context.then(function (newContext) { return mutate(newContext, path); });
              }
              if ('function' === typeof context) {
                  return context(mutate, rootContext);
              }
              if ('object' === typeof context) {
                  var targetContext = getTargetContext(path || '');
                  if (context === targetContext) {
                      return;
                  }
                  var newContext = assign(assign({}, targetContext), context);
                  if (path) {
                      deepSet(rootContext, path, newContext);
                  }
                  else {
                      rootContext = newContext;
                  }
                  scheduleRender();
              }
          }
      }
      function getTargetContext(path, def) {
          if (def === void 0) { def = {}; }
          return (path ? deepGet(rootContext, path) : rootContext) || def;
      }
      function eventProxy(event) {
          var element = event.currentTarget;
          var props = elementProps.get(element);
          var path = deepGet(props, PATH);
          var newContext = props["on" + event.type](getTargetContext(path), props, event);
          mutate(newContext, path);
      }
      function render() {
          glueNode = rendering(glueNode, view, rootContext, eventProxy, elementProps, rendererProviders.map(function (provider) { return provider(rootContext); }));
      }
      function rendered() {
          scheduled = false;
      }
      function renderedError(e) {
          rendered();
          throw e;
      }
      function scheduleRender() {
          if (!scheduled) {
              scheduled = true;
              Promise.resolve().then(render).then(rendered, renderedError);
          }
      }
      return mutate;
  }

  function currentOnlyEventHandler(eventHandler) {
      return function (context, props, event) {
          if (event.currentTarget === event.target) {
              return eventHandler(context, props, event);
          }
      };
  }

  exports.atto = atto;
  exports.currentOnlyEventHandler = currentOnlyEventHandler;
  exports.x = x;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
