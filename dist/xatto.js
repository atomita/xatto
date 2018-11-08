(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.xatto = {})));
}(this, (function (exports) { 'use strict';

  var ATTRIBUTES = 'attributes';
  var CHILDREN = 'children';
  var KEY = 'key';
  var NAME = 'name';

  var CONTEXT = 'xa.context';
  var EXTRA = 'xa.extra';
  var SLICE = 'xa.slice';
  var TEXT = 'xa.text';
  /*
   * Attributes to be deprecated in v1
   */
  var XA_CONTEXT = 'xa-context';
  var XA_EXTRA = 'xa-extra';
  var XA_SLICE = 'xa-slice';

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

  var CREATE = 'create';
  var DESTROY = 'destroy';
  var REMOVE = 'remove';
  var REMOVING = 'removing';
  var UPDATE = 'update';

  var ELEMENT = 'element';
  var LIFECYCLE = 'lifecycle';
  var PREV = 'prev';
  var PREV_ATTRIBUTES = PREV + "." + ATTRIBUTES;

  var TEXT_NODE = 'xa-txt';

  var XLINK_NS = "http://www.w3.org/1999/xlink";

  function updateAttribute(element, name, value, oldValue, isSVG, eventProxy) {
      if (name === "key" || 'object' === typeof value) {
          // noop
      }
      else {
          if (name[0] === "o" && name[1] === "n") {
              if (!element.events) {
                  element.events = {};
              }
              element.events[(name = name.slice(2))] = value;
              if (value == null) {
                  element.removeEventListener(name, eventProxy);
              }
              else if (oldValue == null) {
                  element.addEventListener(name, eventProxy);
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

  function createElement(node, isSVG, eventProxy) {
      var attributes = node[ATTRIBUTES] || {};
      if (node[NAME] === TEXT_NODE) {
          return document.createTextNode(deepGet(attributes, TEXT));
      }
      var element = (isSVG = isSVG || node[NAME] === "svg")
          ? document.createElementNS("http://www.w3.org/2000/svg", node[NAME])
          : document.createElement(node[NAME]);
      for (var name_1 in attributes) {
          updateAttribute(element, name_1, attributes[name_1], null, isSVG, eventProxy);
      }
      element.context = deepGet(attributes, CONTEXT) || attributes[CONTEXT] || {}; // todo mixed to be deprecated
      element.extra = deepGet(attributes, EXTRA) || attributes[EXTRA] || {}; // todo mixed to be deprecated
      return element;
  }

  function updateElement(node, isSVG, eventProxy) {
      var element = node[ELEMENT];
      var attributes = node[ATTRIBUTES];
      if (node[NAME] === TEXT_NODE) {
          element.nodeValue = deepGet(attributes, TEXT);
          return element;
      }
      var prevAttributes = deepGet(node, PREV_ATTRIBUTES) || {};
      for (var name_1 in attributes) {
          if (attributes[name_1] !==
              (name_1 === "value" || name_1 === "checked"
                  ? element[name_1]
                  : prevAttributes[name_1])) {
              updateAttribute(element, name_1, attributes[name_1], prevAttributes[name_1], isSVG, eventProxy);
          }
      }
      element.context = deepGet(attributes, CONTEXT) || attributes[XA_CONTEXT] || {}; // todo mixed to be deprecated
      element.extra = deepGet(attributes, EXTRA) || attributes[XA_EXTRA] || {}; // todo mixed to be deprecated
      return element;
  }

  function patch(patchStack) {
      return function (glueNode, isSVG, eventProxy, isDestroy) {
          var element;
          if (!isSVG && glueNode[NAME] === 'svg') {
              isSVG = true;
          }
          if (!isDestroy && glueNode[LIFECYCLE] === DESTROY) {
              isDestroy = true;
          }
          var children = glueNode[CHILDREN].reduce(function (acc, childNode) {
              var patchedChild = patchStack(childNode, isSVG, eventProxy, isDestroy);
              return patchedChild ? acc.concat(patchedChild) : acc;
          }, []);
          var lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE];
          switch (lifecycle) {
              case CREATE:
                  element = createElement(glueNode, isSVG, eventProxy);
                  break;
              case UPDATE:
                  element = updateElement(glueNode, isSVG, eventProxy);
                  break;
              case DESTROY:
                  if (glueNode[LIFECYCLE] === DESTROY) {
                      element = glueNode[ELEMENT];
                      element.parentElement.removeChild(element);
                  }
                  return null;
              case REMOVE:
                  glueNode[LIFECYCLE] = REMOVING;
              default:
                  element = glueNode[ELEMENT];
          }
          children.map(function (v) { return v.element; }).reduceRight(function (ref, elm) {
              element.insertBefore(elm, ref);
              return elm;
          }, null);
          glueNode[CHILDREN] = children;
          glueNode[ELEMENT] = element;
          return glueNode;
      };
  }

  var lifeCycleEventPath = function (name) { return ATTRIBUTES + ".on" + name; };

  function pickLifecycleEvents(lifecycleEvents, mutate) {
      return function (stack) { return function (glueNode, isSVG, eventProxy, isDestroy) {
          if (isDestroy === void 0) { isDestroy = false; }
          var lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE];
          var lifecycleEvent;
          switch (lifecycle) {
              case CREATE:
                  lifecycleEvent = deepGet(glueNode, lifeCycleEventPath(CREATE));
                  break;
              case UPDATE:
                  lifecycleEvent = deepGet(glueNode, lifeCycleEventPath(UPDATE));
                  break;
              case REMOVE:
                  var onremove_1 = deepGet(glueNode, lifeCycleEventPath(REMOVE));
                  var done_1 = function () {
                      glueNode[LIFECYCLE] = DESTROY;
                      Promise.resolve().then(mutate);
                  };
                  lifecycleEvent = function (element, attrs, prevAttrs) {
                      onremove_1(element, done_1, attrs, prevAttrs);
                  };
                  break;
              case DESTROY:
                  lifecycleEvent = deepGet(glueNode, lifeCycleEventPath(DESTROY));
                  break;
          }
          if (lifecycleEvent) {
              lifecycleEvents.push(function () {
                  lifecycleEvent(glueNode[ELEMENT], glueNode[ATTRIBUTES], deepGet(glueNode, PREV_ATTRIBUTES));
              });
          }
          return stack(glueNode, isSVG, eventProxy, isDestroy);
      }; };
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function isVNode(value) {
      return null != value
          && 'object' === typeof value
          && ATTRIBUTES in value
          && CHILDREN in value
          && KEY in value
          && NAME in value
          && 4 === Object.keys(value).length;
  }

  function resolveNode(node, parentNode) {
      var attributes = node && node[ATTRIBUTES];
      if (attributes) {
          var context = deepGet(attributes, CONTEXT)
              || attributes[XA_CONTEXT]
              || (parentNode && (deepGet(parentNode, ATTRIBUTES + "." + CONTEXT)
                  || deepGet(parentNode, ATTRIBUTES + "." + XA_CONTEXT)))
              || {}; // todo mixed to be deprecated
          var slice = deepGet(attributes, SLICE) || attributes[XA_SLICE]; // todo mixed to be deprecated
          var sliced = void 0;
          if ('object' !== typeof slice) {
              slice = [slice];
          }
          var path = slice[0];
          if (path) {
              sliced = deepGet(context, path);
              if (!sliced) {
                  var defaultValue = slice[1] || {};
                  sliced = __assign({}, defaultValue);
                  deepSet(context, path, sliced);
              }
              context = sliced;
          }
          var extra = __assign({}, (deepGet(attributes, EXTRA) || attributes[XA_EXTRA] || {}), (parentNode && (deepGet(parentNode, ATTRIBUTES + "." + EXTRA)
              || deepGet(parentNode, ATTRIBUTES + "." + XA_EXTRA)) || {}));
          deepSet(attributes, CONTEXT, context);
          deepSet(attributes, EXTRA, extra);
          deepSet(attributes, SLICE, []);
          attributes[XA_CONTEXT] = context; // todo to be deprecated
          attributes[XA_EXTRA] = extra; // todo to be deprecated
      }
      var resolved = (node && typeof node.name === "function")
          ? resolveNode(node.name(node[ATTRIBUTES], node[CHILDREN]), node)
          : node;
      if (isVNode(resolved)) {
          resolved[CHILDREN] = resolved[CHILDREN].reduce(function (acc, child) {
              var reslvedChild = resolveNode(child, resolved);
              if (reslvedChild) {
                  acc.push(reslvedChild);
              }
              return acc;
          }, []);
          return resolved;
      }
      return null;
  }

  function mergeGlueNode(vNode, glueNode) {
      var newGlueNode;
      if (!glueNode) {
          newGlueNode = __assign({}, vNode);
          newGlueNode[LIFECYCLE] = CREATE;
          newGlueNode[CHILDREN] = vNode[CHILDREN].map(function (child) { return mergeGlueNode(child, null); });
          deepSet(newGlueNode, PREV_ATTRIBUTES, {});
          return newGlueNode;
      }
      if (!vNode) {
          deepSet(glueNode, PREV_ATTRIBUTES, glueNode[ATTRIBUTES]);
          glueNode[LIFECYCLE] = (glueNode[LIFECYCLE] === REMOVING || glueNode[LIFECYCLE] === DESTROY)
              ? glueNode[LIFECYCLE]
              : (deepGet(glueNode, lifeCycleEventPath(REMOVE))
                  ? REMOVE
                  : DESTROY);
          return glueNode;
      }
      deepSet(glueNode, PREV_ATTRIBUTES, glueNode[ATTRIBUTES]);
      glueNode[ATTRIBUTES] = vNode[ATTRIBUTES];
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
              return mergeGlueNode(child, null);
          }
      });
      indexedPrevChildren.reduceRight(function (_, child) {
          child = mergeGlueNode(null, child);
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
      }, 0);
      glueNode[CHILDREN] = children;
      return glueNode;
  }

  function createVNode(mayBeTextNode, name, attributes, children) {
      if (attributes === void 0) { attributes = {}; }
      if (children === void 0) { children = []; }
      var node = {};
      node[NAME] = name;
      node[ATTRIBUTES] = attributes;
      node[CHILDREN] = children;
      node[KEY] = attributes.key;
      if (mayBeTextNode && 'function' !== typeof name) {
          node[NAME] = TEXT_NODE;
          deepSet(node[ATTRIBUTES], TEXT, name);
      }
      return node;
  }

  function x(name, attributes) {
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
      return createVNode(false, name, attributes || {}, children);
  }

  function atto(view, elementOrGlueNode) {
      var scheduled = false;
      var glueNode = elementOrGlueNode instanceof Element
          ? {
              name: elementOrGlueNode.nodeName,
              attributes: {},
              children: [],
              element: elementOrGlueNode
          }
          : elementOrGlueNode;
      var attributes = glueNode[ATTRIBUTES];
      var rootContext = deepGet(attributes, CONTEXT) || attributes[XA_CONTEXT] || {}; // todo mixed to be deprecated
      deepSet(attributes, CONTEXT, rootContext);
      attributes[XA_CONTEXT] = rootContext; // todo to be deprecated
      function mutate(context, actualContext, path) {
          if (context === void 0) { context = null; }
          if (actualContext === void 0) { actualContext = rootContext; }
          if (path === void 0) { path = null; }
          if (context && context !== actualContext) {
              if ('function' === typeof context) {
                  return context(mutate, actualContext, rootContext);
              }
              else if (context instanceof Promise) {
                  return context.then(function (newContext) { return mutate(newContext, actualContext, path); });
              }
              else if ('object' === typeof context) {
                  if (null == path && 'string' === typeof actualContext) {
                      path = actualContext;
                      actualContext = rootContext;
                  }
                  var targetContext_1 = path ? (deepGet(actualContext, path) || {}) : actualContext;
                  Object.entries(context).map(function (_a) {
                      var k = _a[0], v = _a[1];
                      return targetContext_1[k] = v;
                  });
                  if (path) {
                      deepSet(actualContext, path, targetContext_1);
                  }
              }
          }
          scheduleRender();
      }
      function eventProxy(event) {
          var element = event.currentTarget;
          element.context = element.context || {};
          element.extra = element.extra || {};
          var context = element.events[event.type](event, element.context, element.extra);
          mutate(context, element.context);
      }
      function render() {
          var lifecycleEvents = [];
          var node = mergeGlueNode(resolveNode(x(view, attributes, glueNode && glueNode[CHILDREN]), x('div', {}, [])), glueNode);
          var patchStack = [
              pickLifecycleEvents(lifecycleEvents, mutate)
          ].reduce(function (acc, stack) { return stack(acc); }, patch(function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              return patchStack.apply(null, args);
          }));
          glueNode = patchStack(node, 'svg' === node.name, eventProxy, false);
          lifecycleEvents.reduce(function (_, lifecycleEvent) { return lifecycleEvent(); }, 0);
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

  exports.atto = atto;
  exports.x = x;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
