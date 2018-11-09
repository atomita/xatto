(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.xatto = {})));
}(this, (function (exports) { 'use strict';

    var CHILDREN = 'children';
    var KEY = 'key';
    var NAME = 'name';
    var PROPS = 'props';

    var CONTEXT = 'xa.context';
    var EXTRA = 'xa.extra';
    var SLICE = 'xa.slice';
    var TEXT = 'xa.text';

    var ELEMENT = 'element';
    var LIFECYCLE = 'lifecycle';
    var PREV = 'prev';
    var PREV_PROPS = PREV + "." + PROPS;

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
        var newGlueNode = __assign({}, vNode);
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

    function updateElement(node, isSVG, eventProxy, elementProps) {
        var element = node[ELEMENT];
        var props = node[PROPS];
        if (node[NAME] === TEXT_NODE) {
            element.nodeValue = deepGet(props, TEXT);
            return element;
        }
        var prevAttributes = deepGet(node, PREV_PROPS) || {};
        for (var name_1 in props) {
            if (props[name_1] !==
                (name_1 === "value" || name_1 === "checked"
                    ? element[name_1]
                    : prevAttributes[name_1])) {
                updateAttribute(element, name_1, props[name_1], prevAttributes[name_1], isSVG, eventProxy, elementProps);
            }
        }
        elementProps.set(element, props);
        return element;
    }

    function patcher(patchStack, glueNode, isSVG, eventProxy, elementProps, isDestroy) {
        var element;
        if (!isSVG && glueNode[NAME] === 'svg') {
            isSVG = true;
        }
        if (!isDestroy && glueNode[LIFECYCLE] === DESTROY) {
            isDestroy = true;
        }
        var children = glueNode[CHILDREN].reduce(function (acc, childNode) {
            var patchedChild = patchStack(childNode, isSVG, eventProxy, elementProps, isDestroy);
            return patchedChild ? acc.concat(patchedChild) : acc;
        }, []);
        var lifecycle = isDestroy ? DESTROY : glueNode[LIFECYCLE];
        switch (lifecycle) {
            case CREATE:
                element = createElement(glueNode, isSVG, eventProxy, elementProps);
                break;
            case UPDATE:
                element = updateElement(glueNode, isSVG, eventProxy, elementProps);
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
    }
    function patch( /* mutate: Function */) {
        return [
            // patch stack
            function (patchStack) { return partial(patcher, [patchStack]); }
            // There is no post-treatment
        ];
    }

    function pickupLifecycleEvents(lifecycleEvents, mutate, patchStack, glueNode, isSVG, eventProxy, elementProps, isDestroy) {
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
                lifecycleEvent(glueNode[ELEMENT], glueNode[PROPS], deepGet(glueNode, PREV_PROPS));
            });
        }
        return patchStack(glueNode, isSVG, eventProxy, elementProps, isDestroy);
    }
    function pickLifecycleEvents(mutate) {
        var lifecycleEvents = [];
        return [
            function (stack) { return partial(pickupLifecycleEvents, [lifecycleEvents, mutate, stack]); },
            // finally
            function () { return lifecycleEvents.reduce(function (_, lifecycleEvent) { return lifecycleEvent(); }, 0); }
        ];
    }

    function remodelProps(props, context, extra, slice) {
        deepSet(props, CONTEXT, context || deepGet(props, CONTEXT) || {});
        deepSet(props, EXTRA, extra || deepGet(props, EXTRA) || {});
        deepSet(props, SLICE, slice || deepGet(props, SLICE) || []);
        return props;
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

    function resolveChildren(children, parentNode) {
        return children.reduce(function (childs, child) {
            childs.push.apply(childs, resolveNode(child, parentNode));
            return childs;
        }, []);
    }
    function resolveNode(node, parentNode) {
        if (!node) {
            return [];
        }
        if (x === node.name) { // Fragment
            return resolveChildren(node[CHILDREN], parentNode);
        }
        var rawProps = node[PROPS];
        var context = deepGet(rawProps, CONTEXT)
            || (parentNode && deepGet(parentNode, PROPS + "." + CONTEXT))
            || {};
        var slice = deepGet(rawProps, SLICE);
        var sliced;
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
        var extra = __assign({}, (deepGet(rawProps, EXTRA) || {}), (parentNode && deepGet(parentNode, PROPS + "." + EXTRA) || {}));
        var props = remodelProps(rawProps, context, extra, []);
        var resolveds = (typeof node.name === "function"
            ? resolveNode(node.name(props, node[CHILDREN]), node)
            : [node]).reduce(function (acc, resolved) {
            if (isVNode(resolved)) {
                resolved[CHILDREN] = resolveChildren(resolved[CHILDREN], resolved);
                acc.push(resolved);
            }
            return acc;
        }, []);
        return resolveds;
    }

    function atto(view, elementOrGlueNode) {
        var scheduled = false;
        var glueNode = elementOrGlueNode instanceof Element
            ? createGlueNodeByElement(elementOrGlueNode)
            : elementOrGlueNode;
        var rootProps = remodelProps(glueNode[PROPS]);
        var rootContext = deepGet(rootProps, CONTEXT);
        var elementProps = new WeakMap();
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
            var props = elementProps.get(element);
            var context = deepGet(props, CONTEXT);
            var extra = deepGet(props, EXTRA);
            var newContext = props["on" + event.type](event, context, extra);
            mutate(newContext, context);
        }
        function render() {
            var root = resolveNode(x(view, rootProps, glueNode[CHILDREN]))[0];
            var node = mergeGlueNode(root, glueNode);
            var patchStacks = [
                patch( /* mutate */),
                pickLifecycleEvents(mutate)
            ];
            var patchStack = patchStacks.map(function (v) { return v[0]; }).reduce(function (acc, stack) { return stack(acc); }, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return patchStack.apply(null, args);
            });
            glueNode = patchStack(node, 'svg' === node.name, eventProxy, elementProps, false);
            patchStacks.map(function (v) { return v[1] && v[1](); });
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
