/**
 * copy from https://github.com/tjx666/deep-in-fe/blob/master/src/eventEmitter/EventEmitter.js
 */

api.EventEmitter = (function () {
    function spreadArray(to, from, pack) {
        var ar;
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    function EventEmitter() {
        // 使用对象而不是数组是因为一个 emitter 可以订阅不同的事件
        this.listenerStore = {};
        this.maxListenerCount = EventEmitter.defaultMaxListeners;
    }

    /**
     * 添加订阅
     * @param {*} eventName
     * @param {*} listener
     * @param {*} prepend
     */
    EventEmitter.prototype.on = function (eventName, listener, prepend) {
        if (prepend === void 0) {
            prepend = false;
        }
        if (!this.listenerStore[eventName]) this.listenerStore[eventName] = [listener];
        else if (prepend) this.listenerStore[eventName].unshift(listener);
        else this.listenerStore[eventName].push(listener);
        // maxListenersCount 等于 0 时等同于 Infinity
        var currentListenersCount = this.listenerStore[eventName].length;
        // 添加的事件超出最大事件数会报警告
        if (currentListenersCount > (this.maxListenerCount || Infinity)) {
            $.writeln(
                'You had add ' +
                    currentListenersCount +
                    'listeners, more than the max listeners count: ' +
                    this.maxListenerCount,
            );
        }
        return this;
    };

    /**
     * 每次删除一个事件名是 event 的 listener， 如果同一个函数被多次添加为 listener，需要多次调用 off
     * @param {*} eventName
     * @param {*} listener
     */
    EventEmitter.prototype.off = function (eventName, listener) {
        var callbacks = this.listenerStore[eventName];
        if (!callbacks) return;

        var index = 0;
        var existListener;
        for (; index < callbacks.length; index++) {
            existListener = callbacks[index];
            if (existListener === listener || existListener.listener === listener) {
                break;
            }
        }
        if (index !== callbacks.length) this.listenerStore[eventName].splice(index, 1);
        return this;
    };

    // 使用闭包在执行后 off 掉自身即可
    EventEmitter.prototype.once = function (eventName, listener, prepend) {
        var that = this;
        if (prepend === void 0) {
            prepend = false;
        }
        var onceListener = function (data) {
            listener(data);
            that.off(eventName, onceListener);
        };
        onceListener.listener = listener;
        this.on(eventName, onceListener, prepend);
        return this;
    };

    /**
     * 按照注册的顺序同步执行所有事件名为 event 的 listener
     * @param {string} eventName
     * @param  {...any} args 会传给每一个执行 listener
     * @returns {boolean} 如果还有事件名为 event 的 listener 返回 true，否则返回 false
     */
    EventEmitter.prototype.emit = function (eventName, data) {
        if (this.listenerStore[eventName] && this.listenerStore[eventName].length > 0) {
            var listenersCopy = spreadArray([], this.listenerStore[eventName], true);
            for (var i = 0; i < listenersCopy.length; i++) {
                listenersCopy[i](data);
            }
            return true;
        }

        if (!this.listenerStore[eventName] || this.listenerStore[eventName].length === 0) {
            var message = 'You may forget to add listener on ' + eventName;
            $.writeln(message);
            api.emitter.error(message);
        }

        return false;
    };

    EventEmitter.prototype.listeners = function (eventName) {
        return this.listenerStore[eventName]
            ? this.listenerStore[eventName].map(function (listener) {
                  return listener.listener ? listener.listener : listener;
              })
            : [];
    };

    EventEmitter.prototype.rawListeners = function (eventName) {
        return this.listenerStore[eventName] ? this.listenerStore[eventName] : [];
    };

    EventEmitter.prototype.prependListener = function (eventName, listener) {
        return this.on(eventName, listener, true);
    };

    EventEmitter.prototype.prependOnceListener = function (eventName, listener) {
        return this.once(eventName, listener, true);
    };

    EventEmitter.prototype.addListener = function (eventName, listener) {
        return this.on(eventName, listener);
    };

    EventEmitter.prototype.removeListener = function (eventName, listener) {
        return this.off(eventName, listener);
    };

    EventEmitter.prototype.getMaxListeners = function () {
        return this.maxListenerCount;
    };

    EventEmitter.prototype.setMaxListeners = function (n) {
        // 必须为非负数
        if (typeof n !== 'number' || n < 0) {
            throw new Error(
                'The value of "n" is out of range. It must be a non-negative number. Received \'' +
                    n +
                    "'",
            );
        }
        this.maxListenerCount = n;
        return this;
    };

    EventEmitter.prototype.removeAllListeners = function (eventName) {
        var that = this;
        if (!eventName) {
            for (var _eventName in this.listenerStore) {
                if (Object.prototype.hasOwnProperty.call(this.listenerStore, _eventName)) {
                    that.listenerStore[_eventName] = undefined;
                }
            }
        } else {
            this.listenerStore[eventName] = undefined;
        }
        return this;
    };

    // 默认最大订阅数 10
    EventEmitter.defaultMaxListeners = 10;

    return EventEmitter;
})();
