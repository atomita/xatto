(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.xatto = {})));
}(this, (function (exports) { 'use strict';

    var ATTRIBUTES = 'attributes';
    var CHILDREN = 'children';

    var CONTEXT = 'xa-context';
    var EXTRA = 'xa-extra';
    var RECYCLE = 'xa-recycle';

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

    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function resolveNode(node, parentNode) {
        var attributes = node && node[ATTRIBUTES];
        if (attributes) {
            var context = attributes[CONTEXT]
                || (parentNode && parentNode[ATTRIBUTES] && parentNode[ATTRIBUTES][CONTEXT])
                || {};
            var extra = __assign({}, (attributes[EXTRA] || {}), (parentNode && parentNode[ATTRIBUTES] && parentNode[ATTRIBUTES][EXTRA] || {}));
            attributes[CONTEXT] = context;
            attributes[EXTRA] = extra;
        }
        return (node && typeof node.name === "function")
            ? resolveNode(node.name(node[ATTRIBUTES], node[CHILDREN]), node)
            : node != null
                ? node
                : "";
    }

    function updateAttribute(element, name, value, oldValue, isSVG, eventListener) {
        if (name === "key" || 'object' === typeof value) {
            // noop
        }
        else {
            if (name[0] === "o" && name[1] === "n") {
                if (!element.events) {
                    element.events = {};
                }
                element.events[(name = name.slice(2))] = value;
                if (value) {
                    if (!oldValue) {
                        element.addEventListener(name, eventListener);
                    }
                }
                else {
                    element.removeEventListener(name, eventListener);
                }
            }
            else if (name in element && name !== "list" && !isSVG) {
                element[name] = value == null ? "" : value;
            }
            else if (value != null && value !== false) {
                element.setAttribute(name, value);
            }
            if (value == null || value === false) {
                element.removeAttribute(name);
            }
        }
    }

    function createElement(node, lifecycle, isSVG, eventListener) {
        var element = typeof node === "string" || typeof node === "number"
            ? document.createTextNode(node)
            : (isSVG = isSVG || node.name === "svg")
                ? document.createElementNS("http://www.w3.org/2000/svg", node.name)
                : document.createElement(node.name);
        var attributes = node[ATTRIBUTES];
        if (attributes) {
            var callback_1 = attributes.oncreate;
            if (callback_1) {
                lifecycle.push(function () {
                    callback_1(element, {}, attributes[CONTEXT], attributes[EXTRA]);
                });
            }
            for (var i = 0; i < node[CHILDREN].length; i++) {
                element.appendChild(createElement((node[CHILDREN][i] = resolveNode(node[CHILDREN][i], node)), lifecycle, isSVG, eventListener));
            }
            for (var name_1 in attributes) {
                updateAttribute(element, name_1, attributes[name_1], null, isSVG, eventListener);
            }
            element.context = attributes[CONTEXT];
            element.extra = attributes[EXTRA];
        }
        return element;
    }

    function getKey(node) {
        return node ? node.key : null;
    }

    function removeChildren(element, node) {
        var attributes = node[ATTRIBUTES];
        if (attributes) {
            for (var i = 0; i < node[CHILDREN].length; i++) {
                removeChildren(element.childNodes[i], node[CHILDREN][i]);
            }
            if (attributes.ondestroy) {
                attributes.ondestroy(element, attributes, attributes[CONTEXT], attributes[EXTRA]);
            }
        }
        return element;
    }

    function removeElement(parent, element, node) {
        function done() {
            parent.removeChild(removeChildren(element, node));
        }
        var attributes = node[ATTRIBUTES] || {};
        var cb = attributes.onremove;
        if (cb) {
            cb(element, done, attributes, attributes[CONTEXT], attributes[EXTRA]);
        }
        else {
            done();
        }
    }

    function updateElement(element, oldAttributes, attributes, lifecycle, isSVG, eventListener) {
        var attrs = __assign({}, oldAttributes, attributes);
        for (var name_1 in attrs) {
            if (attributes[name_1] !==
                (name_1 === "value" || name_1 === "checked"
                    ? element[name_1]
                    : oldAttributes[name_1])) {
                updateAttribute(element, name_1, attributes[name_1], oldAttributes[name_1], isSVG, eventListener);
            }
        }
        element.context = attributes[CONTEXT];
        element.extra = attributes[EXTRA];
        var callback = attributes[RECYCLE] ? attributes.oncreate : attributes.onupdate;
        if (callback) {
            lifecycle.push(function () {
                callback(element, oldAttributes, attributes[CONTEXT], attributes[EXTRA]);
            });
        }
    }

    function patch(parent, element, oldNode, node, lifecycle, isSVG, eventListener) {
        if (isSVG === void 0) { isSVG = false; }
        if (node === oldNode) {
            // noop
        }
        else if (oldNode == null || oldNode.name !== node.name) {
            var newElement = createElement(node, lifecycle, isSVG, eventListener);
            parent.insertBefore(newElement, element);
            if (oldNode != null) {
                removeElement(parent, element, oldNode);
            }
            element = newElement;
        }
        else if (oldNode.name == null) {
            element.nodeValue = node;
        }
        else {
            updateElement(element, oldNode[ATTRIBUTES], node[ATTRIBUTES], lifecycle, (isSVG = isSVG || node.name === "svg"), eventListener);
            var oldKeyed = {};
            var newKeyed = {};
            var oldElements = [];
            var oldChildren = oldNode[CHILDREN];
            var children = node[CHILDREN];
            for (var i_1 = 0; i_1 < oldChildren.length; i_1++) {
                oldElements[i_1] = element.childNodes[i_1];
                var oldKey = getKey(oldChildren[i_1]);
                if (oldKey != null) {
                    oldKeyed[oldKey] = [oldElements[i_1], oldChildren[i_1]];
                }
            }
            var i = 0;
            var k = 0;
            while (k < children.length) {
                var oldKey = getKey(oldChildren[i]);
                var newKey = getKey(children[k] = resolveNode(children[k], node));
                if (newKeyed[oldKey]) {
                    i++;
                    continue;
                }
                if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
                    if (oldKey == null) {
                        removeElement(element, oldElements[i], oldChildren[i]);
                    }
                    i++;
                    continue;
                }
                var recycle = (children[k][ATTRIBUTES] || {})[RECYCLE];
                if (newKey == null || true === recycle) {
                    if (oldKey == null) {
                        patch(element, oldElements[i], oldChildren[i], children[k], lifecycle, isSVG, eventListener);
                        k++;
                    }
                    i++;
                }
                else {
                    var keyed = oldKeyed[newKey] || [];
                    if (oldKey === newKey) {
                        patch(element, keyed[0], keyed[1], children[k], lifecycle, isSVG, eventListener);
                        i++;
                    }
                    else if (keyed[0]) {
                        patch(element, element.insertBefore(keyed[0], oldElements[i]), keyed[1], children[k], lifecycle, isSVG, eventListener);
                    }
                    else {
                        patch(element, oldElements[i], null, children[k], lifecycle, isSVG, eventListener);
                    }
                    newKeyed[newKey] = children[k];
                    k++;
                }
            }
            while (i < oldChildren.length) {
                if (getKey(oldChildren[i]) == null) {
                    removeElement(element, oldElements[i], oldChildren[i]);
                }
                i++;
            }
            for (var key in oldKeyed) {
                if (!newKeyed[key]) {
                    removeElement(element, oldKeyed[key][0], oldKeyed[key][1]);
                }
            }
        }
        return element;
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
                children.unshift(node);
            }
        }
        return {
            name: name,
            attributes: attributes || {},
            children: children,
            key: attributes && attributes.key
        };
    }

    function atto(view, element, oldNode) {
        if (oldNode === void 0) { oldNode = null; }
        var scheduled = false;
        var attributes = oldNode && oldNode[ATTRIBUTES] || {};
        function eventListener(event) {
            var element = event.currentTarget;
            mutate(element.events[event.type](event, element.context || {}, element.extra || {}));
            function mutate(context) {
                if (context && context !== element.context) {
                    if (context instanceof Promise) {
                        context.then(mutate);
                    }
                    else if ('function' === typeof context.subscribe) {
                        context.subscribe(mutate); // @todo unsubscribe
                    }
                    else if ('object' === typeof context) {
                        Object.entries(context).map(function (_a) {
                            var k = _a[0], v = _a[1];
                            return element.context[k] = v;
                        });
                        scheduleRender();
                    }
                }
            }
        }
        function render() {
            var lifecycle = [];
            var node = resolveNode(x(view, attributes, oldNode && oldNode[CHILDREN]), x('div', {}, []));
            element = patch(element.parentNode, element, oldNode, (oldNode = node), lifecycle, 'svg' === node.name, eventListener);
            attributes[RECYCLE] = false;
            while (lifecycle.length)
                lifecycle.pop()();
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
        return scheduleRender;
    }

    exports.atto = atto;
    exports.x = x;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
