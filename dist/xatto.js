/*
xatto v1.1.1
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

  var NODE = 'node';
  var LIFECYCLE = 'lifecycle';
  var PREV = 'prev';
  var PREV_PROPS = PREV + "." + PROPS;

  function assign(target, source) {
      for (var key in source) {
          if (source.hasOwnProperty(key)) {
              target[key] = source[key];
          }
      }
      return target;
  }

  var CREATE = 'create';
  var DESTROY = 'destroy';
  var REMOVE = 'remove';
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

  function createGlueNode(vNode, next, recursion) {
      var newGlueNode = assign({}, vNode);
      newGlueNode.i = 0;
      newGlueNode[LIFECYCLE] = CREATE;
      newGlueNode[CHILDREN] = vNode[CHILDREN].map(function (child) {
          return recursion(CREATE, child);
      });
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

  function noop() {
      // noop
  }

  function createGlueNodeByElement(element) {
      var glueNode = createGlueNode(createVNode(false, element.nodeName), noop, noop);
      glueNode[NODE] = element;
      return glueNode;
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

  function mutate(getContext, setContext, scheduleRender, context, path) {
      if (context) {
          if (context instanceof Promise) {
              return context.then(function (newContext) {
                  return mutate(getContext, setContext, scheduleRender, newContext, path);
              });
          }
          if ('function' === typeof context) {
              return context(mutate, getContext);
          }
          if ('object' === typeof context) {
              var targetContext = getContext(path);
              if (context === targetContext) {
                  return;
              }
              var newContext = assign(assign({}, targetContext), context);
              setContext(newContext, path);
              scheduleRender();
          }
      }
  }

  function mutateProvider(getContext, setContext, scheduleRender) {
      return function (context, path) {
          if (path === void 0) { path = ''; }
          return mutate(getContext, setContext, scheduleRender, context, path);
      };
  }

  function isObservable(value) {
      return value.subscribe && 'function' == typeof value.subscribe;
  }

  function nowaitPromise(scheduleRender, values, promise, defaultValue) {
      if (defaultValue === void 0) { defaultValue = null; }
      if (!values.has(promise)) {
          values.set(promise, [defaultValue, null, exports.NowaitState.pending]);
          promise
              .then(function (value) {
              values.set(promise, [value, null, exports.NowaitState.fulfilled]);
              scheduleRender();
          })
              .catch(function (err) {
              values.set(promise, [null, err, exports.NowaitState.rejected]);
              scheduleRender();
          });
      }
      return values.get(promise);
  }
  function nowaitObservable(scheduleRender, values, subscriptions, subscribeds, observable, defaultValue) {
      if (defaultValue === void 0) { defaultValue = null; }
      if (!values.has(observable)) {
          values.set(observable, [defaultValue, null, exports.NowaitState.pending]);
      }
      if (!subscriptions.has(observable)) {
          subscriptions.set(observable, observable.subscribe(function (value) {
              subscribeds.add(observable);
              values.set(observable, [value, null, exports.NowaitState.acquired]);
              scheduleRender();
          }, function (err) {
              subscribeds.add(observable);
              values.set(observable, [null, err, exports.NowaitState.rejected]);
              scheduleRender();
          }, function () {
              var value = values.has(observable)
                  ? values.get(observable)[0]
                  : null;
              subscribeds.add(observable);
              values.set(observable, [value, null, exports.NowaitState.fulfilled]);
              scheduleRender();
          }));
      }
      if (subscribeds.has(observable)) {
          subscribeds.delete(observable);
      }
      return values.get(observable);
  }
  (function (NowaitState) {
      NowaitState[NowaitState["pending"] = 0] = "pending";
      NowaitState[NowaitState["fulfilled"] = 1] = "fulfilled";
      NowaitState[NowaitState["rejected"] = 2] = "rejected";
      NowaitState[NowaitState["acquired"] = 3] = "acquired";
  })(exports.NowaitState || (exports.NowaitState = {}));
  function createNowait(scheduleRender, values, subscriptions, subscribeds) {
      return function (mayBeAsync, defaultValue) {
          if (defaultValue === void 0) { defaultValue = null; }
          if (null == mayBeAsync) {
              return [defaultValue, null, exports.NowaitState.fulfilled];
          }
          if (mayBeAsync instanceof Promise) {
              return nowaitPromise(scheduleRender, values, mayBeAsync, defaultValue);
          }
          if (isObservable(mayBeAsync)) {
              return nowaitObservable(scheduleRender, values, subscriptions, subscribeds, mayBeAsync, defaultValue);
          }
          if (mayBeAsync instanceof Error) {
              return [null, mayBeAsync, exports.NowaitState.rejected];
          }
          return [mayBeAsync, null, exports.NowaitState.fulfilled];
      };
  }
  function createNowaitUnsubscribe(subscriptions, subscribeds) {
      return function () {
          subscribeds.forEach(function (target) {
              if (subscriptions.has(target)) {
                  var subscription = subscriptions.get(target);
                  subscriptions.delete(target);
                  subscription.unsubscribe();
              }
          });
          subscribeds.clear();
      };
  }

  function nowaitProvider(scheduleRender) {
      var values = new WeakMap();
      var subscriptions = new Map();
      var subscribeds = new Set();
      return [
          createNowait(scheduleRender, values, subscriptions, subscribeds),
          createNowaitUnsubscribe(subscriptions, subscribeds)
      ];
  }

  function remodelProps(props, context, extra, path) {
      deepSet(props, CONTEXT, context || deepGet(props, CONTEXT) || {});
      deepSet(props, EXTRA, extra || deepGet(props, EXTRA) || {});
      deepSet(props, PATH, path || '');
      return props;
  }

  function eventProxyProvider(mutate, getContext, eventTargetProps) {
      return function (event) {
          var node = event.currentTarget;
          var props = eventTargetProps.get(node) || {};
          var path = deepGet(props, PATH) || '';
          var detail = event.detail || {};
          var newContext = props['on' + event.type](getContext(path), detail, props, event);
          mutate(newContext, path);
      };
  }

  var shouldBeCaptureLifecycles = {};
  shouldBeCaptureLifecycles[REMOVE] = 1;
  shouldBeCaptureLifecycles[DESTROY] = 2;
  function resolveLifecycle(rawLifecycle, captureLifecycle, glueNode, removedNodes) {
      var shouldBeCaptureLifecycle = shouldBeCaptureLifecycles[rawLifecycle];
      var shouldBeCaptureLifecycleByCaptured = shouldBeCaptureLifecycles[captureLifecycle];
      var lifecycle = (shouldBeCaptureLifecycleByCaptured &&
          (!shouldBeCaptureLifecycle ||
              shouldBeCaptureLifecycle < shouldBeCaptureLifecycleByCaptured) &&
          captureLifecycle) ||
          rawLifecycle;
      if (REMOVE == lifecycle) {
          var node = glueNode[NODE];
          return removedNodes.get(node) ||
              (REMOVE == rawLifecycle && !deepGet(glueNode, PROPS + ".on" + REMOVE))
              ? DESTROY
              : REMOVE;
      }
      return lifecycle;
  }

  function glueNodeMerger(removedNodes, next, recursion, captureLifecycle, vNode, glueNode) {
      if (!glueNode) {
          return createGlueNode(vNode, next, recursion);
      }
      if (!vNode) {
          deepSet(glueNode, PREV_PROPS, glueNode[PROPS]);
          var lifecycle_1 = resolveLifecycle(REMOVE != captureLifecycle && DESTROY != captureLifecycle
              ? REMOVE
              : UPDATE, captureLifecycle, glueNode, removedNodes);
          glueNode[LIFECYCLE] = lifecycle_1;
          glueNode[CHILDREN] = glueNode[CHILDREN].map(function (child) {
              return recursion(lifecycle_1, null, child);
          });
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
              if (child[NAME] == _prevChild[NAME] &&
                  child[KEY] == _prevChild[KEY] &&
                  (UPDATE === _prevChild[LIFECYCLE] || CREATE === _prevChild[LIFECYCLE])) {
                  prevChild = _prevChild;
                  break;
              }
          }
          if (prevChild) {
              indexedPrevChildren.splice(i, 1);
              return recursion(UPDATE, child, prevChild);
          }
          else {
              return recursion(UPDATE, child);
          }
      });
      indexedPrevChildren.map(function (child) {
          child = recursion(UPDATE, null, child);
          if (0 === child.i) {
              children.unshift(child);
          }
          else {
              var index = child.i - 1;
              var i = void 0;
              for (i = 0; i < children.length; i++) {
                  if (index === children[i].i) {
                      children.splice(i + 1, 0, child);
                      return;
                  }
              }
              children.push(child);
          }
      });
      glueNode[CHILDREN] = children;
      return glueNode;
  }

  function glueNodeMergerProvider(removedNodes) {
      return function (next, recursion) { return function (captureLifecycle, vNode, glueNode) {
          return glueNodeMerger(removedNodes, next, recursion, captureLifecycle, vNode, glueNode);
      }; };
  }

  var XLINK_NS = "http://www.w3.org/1999/xlink";

  function updateAttribute(element, name, value, oldValue, isSVG, eventProxy) {
      if (name[0] === 'o' && name[1] === 'n') {
          var eventName = name.slice(2);
          if (!(value instanceof Function)) {
              element.removeEventListener(eventName, eventProxy);
          }
          else if (!(oldValue instanceof Function)) {
              element.addEventListener(eventName, eventProxy);
          }
      }
      else {
          var nullOrFalse = value == null || value === false;
          if (name in element &&
              name !== 'list' &&
              name !== 'draggable' &&
              name !== 'spellcheck' &&
              name !== 'translate' &&
              !isSVG) {
              if (nullOrFalse) {
                  element.removeAttribute(name);
              }
              else {
                  element[name] = value == null ? '' : value;
              }
          }
          else {
              var ns = false;
              if (isSVG) {
                  var originName = name;
                  name = name.replace(/^xlink:?/, '');
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

  function createNode(glueNode, isSVG, eventProxy, eventTargetProps) {
      var props = glueNode[PROPS] || {};
      if (glueNode[NAME] === TEXT_NODE) {
          return document.createTextNode(deepGet(props, TEXT));
      }
      isSVG = isSVG || glueNode[NAME] === 'svg';
      var node = isSVG
          ? document.createElementNS('http://www.w3.org/2000/svg', glueNode[NAME])
          : document.createElement(glueNode[NAME]);
      for (var name_1 in props) {
          if ('object' != typeof props[name_1]) {
              updateAttribute(node, name_1, props[name_1], null, isSVG, eventProxy);
          }
      }
      eventTargetProps.set(node, props);
      return node;
  }

  function fireLifeCycleEventProvider(elm, type, detail) {
      if (detail === void 0) { detail = {}; }
      var events = [
          new CustomEvent('lifecycle', { detail: assign({ type: type }, detail) }),
          new CustomEvent(type, { detail: detail })
      ];
      return function () { return events.map(function (event) { return elm.dispatchEvent(event); }); };
  }

  function updateNode(glueNode, isSVG, eventProxy, eventTargetProps) {
      var node = glueNode[NODE];
      var props = glueNode[PROPS];
      var prevProps = deepGet(glueNode, PREV_PROPS) || {};
      var updated = false;
      if (glueNode[NAME] === TEXT_NODE) {
          var value = deepGet(props, TEXT);
          var oldValue = deepGet(prevProps, TEXT);
          updated = value != oldValue;
          if (updated) {
              node.nodeValue = deepGet(props, TEXT);
          }
          return [node, updated];
      }
      for (var name_1 in props) {
          if ('object' != typeof props[name_1] &&
              props[name_1] !==
                  (name_1 === 'value' || name_1 === 'checked' ? node[name_1] : prevProps[name_1])) {
              updateAttribute(node, name_1, props[name_1], prevProps[name_1], isSVG, eventProxy);
              updated = true;
          }
      }
      eventTargetProps.set(node, props);
      return [node, updated];
  }

  function patcher(mutate, destroys, lifecycleEvents, eventProxy, eventTargetProps, removedNodes, next, recursion, glueNode, isSVG) {
      var _a;
      var newGlueNode = assign({}, glueNode);
      var node = glueNode[NODE];
      if (!isSVG && glueNode[NAME] === 'svg') {
          isSVG = true;
      }
      var lifecycle = newGlueNode[LIFECYCLE];
      var lifecycleEvent;
      var detail = null;
      switch (lifecycle) {
          case CREATE:
              lifecycleEvent = true;
              node = createNode(glueNode, isSVG, eventProxy, eventTargetProps);
              break;
          case UPDATE:
              _a = updateNode(glueNode, isSVG, eventProxy, eventTargetProps), node = _a[0], lifecycleEvent = _a[1];
              break;
          case DESTROY:
              lifecycleEvent = true;
              destroys.push(function () {
                  var parent = node.parentElement || node.parentNode;
                  parent && parent.removeChild(node);
              });
              break;
          case REMOVE:
              if (!removedNodes.has(node)) {
                  removedNodes.set(node, false);
                  lifecycleEvent = true;
                  detail = {
                      done: function () {
                          removedNodes.set(node, true);
                          Promise.resolve({}).then(mutate);
                      }
                  };
              }
      }
      if (lifecycleEvent) {
          lifecycleEvents.push(fireLifeCycleEventProvider(node, lifecycle, detail));
      }
      var children = glueNode[CHILDREN].reduce(function (acc, childNode) {
          var patchedChild = recursion(childNode, isSVG);
          return patchedChild ? acc.concat(patchedChild) : acc;
      }, []);
      if (lifecycle === DESTROY) {
          return null;
      }
      children
          .map(function (v) { return v[NODE]; })
          .reduceRight(function (ref, elm) {
          if (elm.parentNode !== node
              || elm.nextSibling !== ref) {
              node.insertBefore(elm, ref);
          }
          return elm;
      }, null);
      newGlueNode[CHILDREN] = children;
      newGlueNode[NODE] = node;
      return newGlueNode;
  }

  function patcherProvider(mutate, destroys, lifecycleEvents, eventProxy, eventTargetProps, removedNodes) {
      return function (next, recursion) { return function (glueNode, isSVG) {
          return patcher(mutate, destroys, lifecycleEvents, eventProxy, eventTargetProps, removedNodes, next, recursion, glueNode, isSVG);
      }; };
  }

  function isVNode(value) {
      return (null != value &&
          'object' === typeof value &&
          PROPS in value &&
          CHILDREN in value &&
          KEY in value &&
          NAME in value);
  }

  /**
   * x
   *
   * @param  name {string | Component}
   * @param  props {object}
   * @param  ... {object}
   * @return {VNode}
   */
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
              children.unshift((isVNode(node) && node) || createVNode(true, node));
          }
      }
      return createVNode(false, name, props || {}, children);
  }

  function resolveChildren(next, recursion, children, parentNode) {
      return children.reduce(function (childs, child) {
          childs.push.apply(childs, recursion(child, parentNode));
          return childs;
      }, []);
  }
  function resolver(getContext, setContext, next, recursion, node, parentNode) {
      if (!node) {
          return [];
      }
      if (x === node.name) {
          // Fragment
          return resolveChildren(next, recursion, node[CHILDREN], parentNode);
      }
      var rawProps = node[PROPS];
      var parentProps = (parentNode && parentNode[PROPS]) || {};
      var path = deepGet(rawProps, PATH);
      if (!path) {
          var parentPath = deepGet(parentProps, PATH) || '';
          var slice = deepGet(rawProps, SLICE);
          if (slice != null) {
              slice = "" + slice;
          }
          path =
              parentPath && slice
                  ? parentPath + "." + slice
                  : (slice || parentPath);
      }
      var sliced = getContext(path);
      if (!sliced) {
          var fill = deepGet(rawProps, FILL) || {};
          sliced = assign({}, fill);
          setContext(sliced, path);
      }
      var context = sliced;
      var extra = assign(assign({}, deepGet(rawProps, EXTRA) || {}), (parentNode && deepGet(parentNode, PROPS + "." + EXTRA)) || {});
      var props = remodelProps(rawProps, context, extra, path);
      var resolveds = (typeof node.name === 'function'
          ? recursion(node.name(props, node[CHILDREN]), node)
          : [node]).reduce(function (acc, resolved) {
          if (isVNode(resolved)) {
              resolved[CHILDREN] = resolveChildren(next, recursion, resolved[CHILDREN], resolved);
              acc.push(resolved);
          }
          return acc;
      }, []);
      return resolveds;
  }

  function resolverProvider(getContext, setContext) {
      return function (next, recursion) { return function (node, parentNode) { return resolver(getContext, setContext, next, recursion, node, parentNode); }; };
  }

  function rendererProvider(mutate, getContext, setContext /*, view, glueNode */) {
      var eventTargetProps = new WeakMap();
      var removedNodes = new WeakMap();
      var eventProxy = eventProxyProvider(mutate, getContext, eventTargetProps);
      return function () {
          var destroys = [];
          var lifecycleEvents = [];
          return [
              // resolver
              resolverProvider(getContext, setContext),
              // meger
              glueNodeMergerProvider(removedNodes),
              // pather
              patcherProvider(mutate, destroys, lifecycleEvents, eventProxy, eventTargetProps, removedNodes),
              // finallyer
              function () { return function () {
                  lifecycleEvents.reduceRight(function (_, lifecycleEvent) { return lifecycleEvent(); }, 0);
                  destroys.reduceRight(function (_, destroy) { return destroy(); }, 0);
              }; }
          ];
      };
  }

  function rendering(glueNode, view, extra, renderers) {
      var resolverRecursion = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return resolver.apply(null, args);
      };
      var resolver = renderers
          .map(function (v) { return v[0]; })
          .reduce(wrapOnion, [noop, resolverRecursion])[0];
      var glueNodeMergerRecursion = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return glueNodeMerger.apply(null, args);
      };
      var glueNodeMerger = renderers
          .map(function (v) { return v[1]; })
          .reduce(wrapOnion, [noop, glueNodeMergerRecursion])[0];
      var patcherRecursion = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return patcher.apply(null, args);
      };
      var patcher = renderers
          .map(function (v) { return v[2]; })
          .reduce(wrapOnion, [noop, patcherRecursion])[0];
      var finallyer = renderers.map(function (v) { return v[3]; }).reduce(wrapOnion, [noop, noop])[0];
      var vNodes = resolver(x(view, { xa: { extra: extra } }, []));
      var container = assign({}, glueNode);
      container[CHILDREN] = vNodes;
      var node = glueNodeMerger(UPDATE, container, glueNode);
      glueNode = patcher(node, 'svg' === node.name);
      finallyer();
      return glueNode;
  }
  function wrapOnion(_a, stack) {
      var next = _a[0], recursion = _a[1];
      return [stack ? stack(next, recursion) : next, recursion];
  }

  /**
   * atto
   *
   * @param  view {(props: Props, children: VNode[]) => VNode}
   * @param  containerOrGlueNode {Element | GlueNode}
   * @param  options {object} default: `{}`
   * @return {Function}
   */
  function atto(view, containerOrGlueNode, options) {
      if (options === void 0) { options = {}; }
      var scheduled = false;
      var renderNow = false;
      var rerender = false;
      var glueNode = containerOrGlueNode instanceof Element
          ? createGlueNodeByElement(containerOrGlueNode)
          : containerOrGlueNode;
      var rootProps = remodelProps(glueNode[PROPS]);
      var rootContext = deepGet(rootProps, CONTEXT);
      var middlewares = (MIDDLEWARES in options && options[MIDDLEWARES]) || [];
      var mutate = mutateProvider(getContext, setContext, scheduleRender);
      var _a = nowaitProvider(scheduleRender), nowait = _a[0], nowaitUnsubscribe = _a[1];
      var extra = { mutate: mutate, nowait: nowait };
      var rendererProviders = [rendererProvider]
          .concat(middlewares)
          .map(function (provider) {
          return provider(mutate, getContext, setContext, view, glueNode);
      });
      function getContext(path, def) {
          if (def === void 0) { def = {}; }
          return (path ? deepGet(rootContext, path) : rootContext) || def;
      }
      function setContext(newContext, path) {
          if (path) {
              deepSet(rootContext, path, newContext);
          }
          else {
              rootContext = newContext;
          }
      }
      function render() {
          try {
              renderNow = true;
              glueNode = rendering(glueNode, view, extra, rendererProviders.map(function (provider) { return provider(); }));
          }
          finally {
              renderNow = false;
          }
      }
      function rendered() {
          scheduled = false;
          if (rerender) {
              rerender = false;
              scheduleRender();
          }
          else {
              nowaitUnsubscribe();
          }
      }
      function renderedError(e) {
          rendered();
          throw e;
      }
      function scheduleRender() {
          if (!scheduled) {
              scheduled = true;
              Promise.resolve()
                  .then(render)
                  .then(rendered, renderedError);
          }
          else if (renderNow) {
              rerender = true;
          }
      }
      return mutate;
  }

  function Context(_a, children) {
      var slice = _a.slice, fill = _a.fill;
      return x(ContextInner, { xa: { slice: slice, fill: fill }, children: children });
  }
  function ContextInner(_a) {
      var children = _a.children;
      return x(x, {}, children);
  }

  /**
   * @param  eventHandler {Function}
   * @return {Function}
   */
  function currentOnly(eventHandler) {
      return function (context, detail, props, event) {
          if (event.currentTarget === event.target) {
              return eventHandler(context, detail, props, event);
          }
      };
  }

  function Extra(props, children) {
      return x(ExtraInner, { xa: { extra: props }, children: children });
  }
  function ExtraInner(_a) {
      var children = _a.children;
      return x(x, {}, children);
  }

  exports.atto = atto;
  exports.Context = Context;
  exports.currentOnly = currentOnly;
  exports.Extra = Extra;
  exports.x = x;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
