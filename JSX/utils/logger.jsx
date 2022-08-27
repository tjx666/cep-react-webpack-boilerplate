api.logger = (function () {
    const emitter = api.emitter;
    var isProd = api.constants.isProd;

    function _log(argumentsObj, level) {
        var args = Array.prototype.slice.call(argumentsObj);
        var str,
            lastArg,
            options = {};
        if (args.length === 0) {
            str = '';
        } else if (args.length === 1) {
            str = '' + args[0];
        } else {
            lastArg = args[args.length - 1];
            if (lastArg !== null && typeof lastArg === 'object') {
                Object.assign(options, lastArg);
                str = args.slice(0, args.length - 1).join(' ');
            } else {
                str = args.join(' ');
            }
        }

        if (options.placeholder) {
            var keys = Object.keys(options.placeholder);
            for (var i = 0, key; i < keys.length; i++) {
                key = keys[i];
                // NOTE: 不用 ${} 是因为和 VSCode 的 template-string-converter 插件冲突
                str = str.replace('$(' + key + ')', '' + options.placeholder[key]);
            }
        }

        var strToFile = str;
        var strToConsole = str;

        // ExtendScript debug 控制台不支持输出颜色，因此像 warn, error 级别只能通过前缀来标识
        if (level !== 'debug' && level !== 'info') {
            strToConsole = '[' + level.toUpperCase() + '] ' + strToConsole;
        }

        // 控制台直接输出原字符串即可，时间戳在控制台输出一般没什么用
        if (!isProd) {
            $.writeln(strToConsole);
            emitter.emit('logger.log', {
                content: strToFile,
                level: level,
            });
        } else {
            // 生产环境不输出到 JSX 标准输出流
            // 并且 debug 以上的级别才会输出到日志文件
            if (level !== 'debug') {
                emitter.emit('logger.log', {
                    content: strToFile,
                    level: level,
                });
            }
        }

        return str;
    }

    function debug() {
        _log(arguments, 'debug');
    }

    function info() {
        _log(arguments, 'info');
    }

    function warn() {
        _log(arguments, 'warn');
    }

    function error() {
        _log(arguments, 'error');
    }

    function section(title) {
        debug('------------------------ ' + title + ' -----------------------------');
    }

    return {
        debug: debug,
        info: info,
        warn: warn,
        error: error,
        section: section,
    };
})();
