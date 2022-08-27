(function () {
    function hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    /**
     * @param {string} propPathStr
     * @return {string[]}
     */
    function parsePropPathStrToArray(propPathStr) {
        return propPathStr
            .replaceAll(/^\[([^\r\n]*?)\]/g, '$1')
            .replaceAll(/\[([^\r\n]*?)\]/g, '.$1')
            .split('.');
    }

    /**
     * lodash get
     * @param {Object} object
     * @param {string | Array<string|number>} path
     * @param {any} defaultValue
     */
    function getIn(object, path, defaultValue) {
        if (!(Array.isArray(path) || typeof path === 'string')) {
            throw Error('The path: ' + path + ' is neither array nor string!');
        }

        var propPath;
        if (Array.isArray(path)) {
            propPath = path;
        } else {
            // 特殊情况例如：'[1].b'，所以字符串头部的中括号需要特殊处理
            propPath = parsePropPathStrToArray(path);
        }

        var value = object;
        while (propPath.length && value !== undefined && value !== null) {
            const frontProp = propPath.shift();
            value = value[frontProp];
        }

        // getIn({ a: null }, 'a', 6) 返回 null
        // lodash _.get(null, [], 6) 返回 6 应该是 bug
        if (propPath.length === 0 && value === null) return value;

        return value == null ? defaultValue : null;
    }

    /**
     * 判断 value 是不是一个对象
     * @param {any} value
     * @returns {boolean}
     */
    function isObject(value) {
        var type = typeof value;
        return value !== null && (type === 'object' || type === 'function');
    }

    /**
     * 深度克隆
     * @param {object} obj
     * @returns
     */
    function cloneDeep(obj) {
        var traveledObjects = [];
        var clonedObjects = [];

        function clone(obj) {
            if (!isObject(obj)) return obj;

            var index = traveledObjects.indexOf(obj);
            if (index !== -1) {
                return clonedObjects[index];
            }

            traveledObjects.push(obj);
            var clonedObject;
            var Constructor = obj.constructor;
            if (Constructor === Date) {
                clonedObject = new Date(obj.getTime());
            } else if (Constructor === RegExp) {
                clonedObject = new RegExp(obj);
            } else if (Constructor === Function) {
                throw new Error('not support clone function!');
            } else {
                clonedObject = new Constructor();
            }
            clonedObjects.push(clonedObject);

            for (var key in obj) {
                if (hasOwn(obj, key)) {
                    clonedObject[key] = clone[obj[key]];
                }
            }
            return clonedObject;
        }

        return clone(obj);
    }

    Object.assign(api._, {
        parsePropPathStrToArray: parsePropPathStrToArray,
        getIn: getIn,
        cloneDeep: cloneDeep,
    });
})();
