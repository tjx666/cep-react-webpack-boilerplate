(function () {
    if (typeof Array.isArray === 'undefined') {
        Array.isArray = function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
    }

    if (typeof Array.prototype.indexOf === 'undefined') {
        /**
         * 获取元素在数组中的下标，如果没有，返回 -1
         * @param {Array} array
         * @param {any} element
         * @returns {number}
         */
        Array.prototype.indexOf = function indexOf(element) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === element) {
                    return i;
                }
            }

            return -1;
        };
    }

    if (typeof Array.prototype.includes === 'undefined') {
        Array.prototype.includes = function includes(element) {
            return this.indexOf(element) !== -1;
        };
    }

    if (typeof Array.prototype.filter === 'undefined') {
        Array.prototype.filter = function filter(predicate, thisArg) {
            // eslint-disable-next-line consistent-this
            if (thisArg === undefined) thisArg = this;
            // eslint-disable-next-line consistent-this
            var array = this;

            const result = [];
            for (var index = 0; index < array.length; index++) {
                var element = array[index];
                if (predicate.call(thisArg, element, index, array)) {
                    result.push(element);
                }
            }
            return result;
        };
    }

    if (typeof Array.prototype.find === 'undefined') {
        Array.prototype.find = function find(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }

            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }

            return undefined;
        };
    }

    // https://github.com/msn0/mdn-polyfills/blob/master/src/Array.prototype.findIndex/findIndex.js
    if (typeof Array.prototype.findIndex === 'undefined') {
        Array.prototype.findIndex = function findIndex(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        };
    }

    if (typeof Array.prototype.forEach === 'undefined') {
        Array.prototype.forEach = function forEach(callback, thisArg) {
            var T, k;

            if (this === null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling toObject() passing the
            // |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get() internal
            // method of O with the argument "length".
            // 3. Let len be toUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If isCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let
            // T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {
                var kValue;

                // a. Let Pk be ToString(k).
                //    This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty
                //    internal method of O with argument Pk.
                //    This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {
                    // i. Let kValue be the result of calling the Get internal
                    // method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as
                    // the this value and argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }

    if (typeof Array.prototype.map === 'undefined') {
        Array.prototype.map = function map(callbackfn, thisArg) {
            // eslint-disable-next-line consistent-this
            var list = this;
            var result = [];
            for (var i = 0; i < list.length; i++) {
                var mapper = callbackfn.call(thisArg, list[i], i, list);
                result.push(mapper);
            }

            return result;
        };
    }

    // https://github.com/korbinzhao/array-from-polyfill/blob/master/src/index.js
    if (typeof Array.from === 'undefined') {
        Array.from = (function () {
            var toStr = Object.prototype.toString;
            var isCallable = function (fn) {
                return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
            };
            var toInteger = function (value) {
                var number = Number(value);
                if (isNaN(number)) {
                    return 0;
                }
                if (number === 0 || !isFinite(number)) {
                    return number;
                }
                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function (value) {
                var len = toInteger(value);
                return Math.min(Math.max(len, 0), maxSafeInteger);
            };

            // The length property of the from method is 1.
            return function from(arrayLike /*, mapFn, thisArg */) {
                // 1. Let C be the this value.
                // eslint-disable-next-line consistent-this
                var C = this;

                // 2. Let items be ToObject(arrayLike).
                var items = Object(arrayLike);

                // 3. ReturnIfAbrupt(items).
                if (arrayLike == null) {
                    throw new TypeError(
                        'Array.from requires an array-like object - not null or undefined',
                    );
                }

                // 4. If mapfn is undefined, then let mapping be false.
                var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
                var T;
                if (typeof mapFn !== 'undefined') {
                    // 5. else
                    // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                    if (!isCallable(mapFn)) {
                        throw new TypeError(
                            'Array.from: when provided, the second argument must be a function',
                        );
                    }

                    // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    if (arguments.length > 2) {
                        T = arguments[2];
                    }
                }

                // 10. Let lenValue be Get(items, "length").
                // 11. Let len be ToLength(lenValue).
                var len = toLength(items.length);

                // 13. If IsConstructor(C) is true, then
                // 13. a. Let A be the result of calling the [[Construct]] internal method
                // of C with an argument list containing the single item len.
                // 14. a. Else, Let A be ArrayCreate(len).
                var A = isCallable(C) ? Object(new C(len)) : new Array(len);

                // 16. Let k be 0.
                var k = 0;
                // 17. Repeat, while k < len… (also steps a - h)
                var kValue;
                while (k < len) {
                    kValue = items[k];
                    if (mapFn) {
                        A[k] =
                            typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                    } else {
                        A[k] = kValue;
                    }
                    k += 1;
                }
                // 18. Let putStatus be Put(A, "length", len, true).
                A.length = len;
                // 20. Return A.
                return A;
            };
        })();
    }

    // https://github.com/tc39/proposal-relative-indexing-method#polyfill
    if (typeof Array.prototype.at === 'undefined') {
        Array.prototype.at = function at(n) {
            // ToInteger() abstract op
            n = Math.floor(n) || 0;
            // Allow negative indexing from the end
            if (n < 0) n += this.length;
            // OOB access is guaranteed to return undefined
            if (n < 0 || n >= this.length) return undefined;
            // Otherwise, this is just normal property access
            return this[n];
        };
    }

    // https://github.com/msn0/mdn-polyfills/blob/master/src/Array.prototype.some/some.js
    if (typeof Array.prototype.some === 'undefined') {
        Array.prototype.some = function some(callback, thisArg) {
            if (this == null) {
                throw new TypeError('Array.prototype.some called on null or undefined');
            }

            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            var t = Object(this);
            var len = t.length >>> 0;

            // eslint-disable-next-line no-redeclare
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && callback.call(thisArg, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    if (typeof Array.prototype.every === 'undefined') {
        Array.prototype.every = function every(callback, thisArg) {
            if (this == null) {
                throw new TypeError('Array.prototype.every called on null or undefined');
            }

            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            var t = Object(this);
            var len = t.length >>> 0;

            // eslint-disable-next-line no-redeclare
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && !callback.call(thisArg, t[i], i, t)) {
                    return false;
                }
            }

            return true;
        };
    }
})();
