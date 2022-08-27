api.emitter = (function () {
    var EventEmitter = api.EventEmitter;
    var isProd = api.constants.isProd;
    var getErrorDetails = api.exception.getErrorDetails;

    var toString = Object.prototype.toString;
    var emitter = new EventEmitter();
    var callbackId = 0;
    var eventNamePrefix = 'boilerplate.';

    /**
     * 序列化 data
     *
     * CSXSEvent data 传输时类型在 browser script 中接受的规则：
     * 默认支持 null 和 undefined 以外的类型
     * 对于 boolean 类型会被转换成 number，你传 true，那边接受的就是 0, false 就是 1
     * 对于 string 类型会先会被 JSON.parse，如果无法被 parse，那会被直接当字符串处理
     *   可 parse 时，例如 data 是 'true', '{"name": "xxx" }' 分别会被解析成 boolean true, 和对象 { name: 'xxx' }
     *   不可 parse 时，例如 data 是 'abc'，'undefined'，分别会被解析成字符串 'abc' 和字符串 'undefined'
     * 对于其它类型也就是 function 和 object，接受的类型是字符串，其实就是调用 toString 的结果，
     * 例如: data 是 function(){}, { name: 'ly' }，分别被接受为字符串 'function(){}' 和 '[object Object]'
     *
     * 在设计通信接口的时候，对于用户友好的设计是让 data 是什么类型，browser script 接受到的就是什么类型
     * @param {any} data
     * @returns
     */
    function serializeData(data) {
        // 这俩类型没啥实际意义
        if (typeof data === 'function' || typeof data === 'undefined') {
            throw new TypeError('The data type: ' + typeof data + ' is not supported!');
        }

        try {
            data = JSON.stringify(data);
        } catch (error) {
            $.writeln('The data: ' + data + "can't be JSON stringify");
            throw error;
        }

        return data;
    }

    /**
     * 发送 CSXSEvent
     * @param {string} type
     * @param {any} data
     */
    function sendEvent(type, data) {
        var event = new CSXSEvent();
        event.type = type;
        event.data = serializeData(data);
        event.dispatch();
    }

    /**
     * 向浏览器发送事件
     * @param {string} eventName
     * @param {any} data
     * @param {(data: any) => void} onResponse 当注册了 response 回调时，browser script 可以 response 这个事件
     */
    function emit(eventName, data, onResponse) {
        if (typeof data === 'function') {
            throw new TypeError("data can't be function");
        }

        var event = new CSXSEvent();
        event.type = eventNamePrefix + eventName;
        if (onResponse) {
            callbackId++;
            data = {
                __callbackId: callbackId,
                data: data,
            };

            emitter.once(eventNamePrefix + 'browser-response-' + callbackId, function (data) {
                onResponse(data);
            });
        }
        event.data = serializeData(data);

        event.dispatch();
    }

    /**
     * 监听 browser script 发送给 JSX 的事件
     * @param {string} eventName
     * @param {(data: any, response?: (data: any) => void) => void} callback
     * @returns {(data: any) => void} 返回这个函数的目的在于可以通过 emitter.off(wrapperCallback) 来取消监听
     */
    function on(eventName, callback) {
        function wrapperCallback(data) {
            var callbackId =
                data instanceof Object && data.__callbackId !== undefined
                    ? data.__callbackId
                    : undefined;

            // 有 callbackId 说明对方注册了 onResponse 函数，需要 JSX 这边 response
            if (callbackId !== undefined) {
                var responseEvent = 'jsx-response-' + callbackId;
                try {
                    callback(data.data, function (data) {
                        if (data === undefined) {
                            data = createResponse(0);
                        }
                        emit(responseEvent, data);
                    });
                } catch (error) {
                    // 统一处理没 catch 的同步代码的异常
                    var errorDetails = getErrorDetails(error);
                    emit(responseEvent, {
                        code: -999,
                        data: null,
                        message:
                            'Occur exception in jsx callback of event "' +
                            eventName +
                            '":\n' +
                            errorDetails,
                        details: errorDetails,
                    });
                }
            } else {
                callback(data);
            }
        }
        emitter.on(eventNamePrefix + eventName, wrapperCallback);
        return wrapperCallback;
    }

    function webEmit(eventName, data) {
        callbackId++;
        emitter.emit(eventNamePrefix + eventName, {
            __callbackId: callbackId,
            data: data,
        });
    }

    function log() {
        var args = Array.from(arguments);
        var logStr = args.join(' ');
        if (!isProd) $.writeln(logStr);
        sendEvent('boilerplate.console.log', logStr);
    }

    function error(data) {
        $.writeln(data);
        sendEvent('boilerplate.console.error', data);
    }

    function alert(data) {
        sendEvent('boilerplate.alert', data);
    }

    function message(content) {
        sendEvent('boilerplate.message', content);
    }

    /**
     * 创建 error 相关信息
     * @param {Error} error
     * @param {string | undefined} message
     * @returns
     */
    function createErrorInfo(error, message) {
        if (message == null && error) {
            message = error.message;
        }

        var details = null;
        if (error) {
            details = getErrorDetails(error);
        }

        return {
            message: message,
            details: details,
        };
    }

    /**
     * 创建 Response
     * @param {number | undefined} code
     * @param {any} data
     * @param {string | undefined} message
     * @returns
     */
    function createResponse(code, data, message) {
        if (code === undefined) {
            code = 0;
        } else {
            if (typeof code !== 'number') {
                throw new TypeError('code must be num, but you pass ' + toString.call(code));
            }
        }

        if (data === undefined) {
            data = null;
        }

        if (message === undefined) {
            message = null;
        } else {
            if (typeof message !== 'string') {
                throw new TypeError(
                    'message must be string, but you pass ' + toString.call(message),
                );
            }
        }

        var errorInfo = {
            message: message,
            details: null,
        };

        if (data instanceof Error) {
            errorInfo = createErrorInfo(data, message);
            data = null;
        }

        return {
            code: code,
            data: data,
            message: errorInfo.message,
            details: errorInfo.details,
        };
    }

    api.emit = function (eventName, data) {
        api.loadExternalObjects();
        emitter.emit(eventName, data);
    };

    return {
        emitter: emitter,
        emit: emit,
        on: on,
        sendEvent: sendEvent,
        webEmit: webEmit,
        log: log,
        error: error,
        alert: alert,
        message: message,
        createResponse: createResponse,
    };
})();
