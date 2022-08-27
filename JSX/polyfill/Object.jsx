(function () {
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    // Object.assign
    (function () {
        function toObject(val) {
            if (val === null || val === undefined) {
                throw new TypeError('Object.assign cannot be called with null or undefined');
            }

            return Object(val);
        }

        function shouldUseNative() {
            try {
                if (!Object.assign) {
                    return false;
                }

                // Detect buggy property enumeration order in older V8 versions.

                // https://bugs.chromium.org/p/v8/issues/detail?id=4118
                var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
                test1[5] = 'de';
                if (Object.getOwnPropertyNames(test1)[0] === '5') {
                    return false;
                }

                // https://bugs.chromium.org/p/v8/issues/detail?id=3056
                var test2 = {};
                for (var i = 0; i < 10; i++) {
                    test2['_' + String.fromCharCode(i)] = i;
                }
                var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
                    return test2[n];
                });
                if (order2.join('') !== '0123456789') {
                    return false;
                }

                // https://bugs.chromium.org/p/v8/issues/detail?id=3056
                var test3 = {};
                'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
                    test3[letter] = letter;
                });
                if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
                    return false;
                }

                return true;
            } catch (err) {
                // We don't expect any of the above to throw, but better to be safe.
                return false;
            }
        }

        if (!shouldUseNative()) {
            Object.assign = function assign(target, source) {
                var from;
                var to = toObject(target);
                var symbols;

                for (var s = 1; s < arguments.length; s++) {
                    from = Object(arguments[s]);

                    for (var key in from) {
                        if (hasOwnProperty.call(from, key)) {
                            to[key] = from[key];
                        }
                    }

                    if (getOwnPropertySymbols) {
                        symbols = getOwnPropertySymbols(from);
                        for (var i = 0; i < symbols.length; i++) {
                            if (propIsEnumerable.call(from, symbols[i])) {
                                to[symbols[i]] = from[symbols[i]];
                            }
                        }
                    }
                }

                return to;
            };
        }
    })();

    if (typeof Object.keys === 'undefined') {
        Object.keys = function keys(object) {
            var isObject = object !== null && typeof object === 'object';
            if (!isObject) {
                throw new TypeError(object + ' is not object!');
            }

            var ownKeys = [];
            for (var key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    ownKeys.push(key);
                }
            }

            return ownKeys;
        };
    }

    if (typeof Object.values === 'undefined') {
        Object.values = function values(object) {
            var ownKeys = Object.keys(object);
            var ownValues = [];
            var i,
                key,
                len = ownKeys.length;
            for (i = 0; i < len; i++) {
                key = ownKeys[i];
                ownValues.push(object[key]);
            }

            return ownValues;
        };
    }

    if (typeof Object.entries === 'undefined') {
        Object.entries = function entries(target) {
            var props = Object.keys(target);
            var i = props.length;
            var res = new Array(i); // preallocate the Array
            while (i--) {
                res[i] = [props[i], target[props[i]]];
            }

            return res;
        };
    }
})();
