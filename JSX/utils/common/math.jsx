(function () {
    var precision = 1e-4;

    /**
     * 判断 a 是否等于 b
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
    function eq(a, b) {
        return Math.abs(a - b) < precision;
    }

    /**
     * a > b
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
    function gt(a, b) {
        if (eq(a, b)) return false;
        return a - b > 0;
    }

    /**
     * a >= b
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
    function gte(a, b) {
        return eq(a, b) || a - b > 0;
    }

    /**
     * a < b
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
    function lt(a, b) {
        if (eq(a, b)) return false;
        return a - b < 0;
    }

    /**
     * a <= b
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
    function lte(a, b) {
        return eq(a, b) || a - b < 0;
    }

    /**
     * Fisher-Yates shuffle 洗牌算法，打乱数组
     * 当前版本和原版不同的是：当数组长度大于 1，打乱后的数组中元素顺序一定和原来的不一样
     * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     * https://github.com/lodash/lodash/blob/master/shuffle.js
     * @template T
     * @param {Array<T>} arr
     * @return {Array<T>}
     */
    function shuffle(arr) {
        for (var i = 0, lastIndex = arr.length - 1, randomIndex, temp; i < lastIndex; i++) {
            // 往后取随机下标的时候是从 i + 1 开始
            randomIndex = i + 1 + Math.floor(Math.random() * (lastIndex - i));
            temp = arr[i];
            arr[i] = arr[randomIndex];
            arr[randomIndex] = temp;
        }
        return arr;
    }

    function defaultCompare(a, b) {
        return a - b;
    }

    /**
     * 稳定的排序算法
     * @see https://stackoverflow.com/a/32041864/11027903
     * @template T
     * @param {T[]} array
     * @param {(a: T, b: T) => number} compare
     * @returns {T[]}
     */
    function mergeSort(arr, compare) {
        compare = compare || defaultCompare;

        var sorted = arr.slice(),
            n = sorted.length,
            buffer = new Array(n);
        var size, leftStart, left, right, leftLimit, rightLimit, i, temp;
        for (size = 1; size < n; size *= 2) {
            for (leftStart = 0; leftStart < n; leftStart += 2 * size) {
                left = leftStart;
                right = Math.min(left + size, n);
                leftLimit = right;
                rightLimit = Math.min(right + size, n);
                i = left;

                while (left < leftLimit && right < rightLimit) {
                    if (compare(sorted[left], sorted[right]) <= 0) {
                        buffer[i++] = sorted[left++];
                    } else {
                        buffer[i++] = sorted[right++];
                    }
                }

                while (left < leftLimit) {
                    buffer[i++] = sorted[left++];
                }

                while (right < rightLimit) {
                    buffer[i++] = sorted[right++];
                }
            }

            temp = sorted;
            sorted = buffer;
            buffer = temp;
        }

        return sorted;
    }

    /**
     * 对数字取指定位数的小数
     * @param {number} num
     * @param {number} [fractionDigits=3]
     */
    function toFixed(num, fractionDigits) {
        var numStr = num.toString(10);
        var dotIndex = numStr.indexOf('.');
        if (dotIndex === -1) return num;

        if (fractionDigits === undefined) fractionDigits = 3;
        var multiplex = Math.pow(10, fractionDigits);
        return Math.round(num * multiplex) / multiplex;
    }

    /**
     * 数组去重
     * @template T
     * @param {Array<T>} array
     * @returns {Array<T>}
     */
    function deduplicate(array) {
        if (!Array.isArray(array)) throw new TypeError(array + ' is not an a array!');

        const result = [];
        for (var i = 0; i < array.length; i++) {
            if (result.indexOf(array[i]) === -1) {
                result.push(array[i]);
            }
        }

        return result;
    }

    /**
     * 将数字取最接近的偶整数
     * @example 1.2 => 2, 2.1 => 2
     * @param {number} num
     */
    function truncToEven(num) {
        var floorNum = Math.floor(num);
        return floorNum % 2 === 0 ? floorNum : floorNum + 1;
    }

    function assertEqual(a, b) {
        if (!eq(a, b)) throw new Error(a + ' is not equals to ' + b);
    }

    Object.assign(api._, {
        eq: eq,
        gt: gt,
        gte: gte,
        lt: lt,
        lte: lte,
        shuffle: shuffle,
        mergeSort: mergeSort,
        toFixed: toFixed,
        deduplicate: deduplicate,
        truncToEven: truncToEven,
        assertEqual: assertEqual,
    });
})();
