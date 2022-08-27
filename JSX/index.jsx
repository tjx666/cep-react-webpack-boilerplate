(function setup() {
    // 开启 debug 模式
    $.level = 2;
    // 开启严格模式禁止对对象只读属性进行写操作
    $.strict = true;

    // 设置 JSX engin 内存缓存 300MB
    var MAX_MEMORY_CACHE_SIZE = 1024 * 1024 * 300;
    // 默认是 100k
    if ($.memCache < MAX_MEMORY_CACHE_SIZE) {
        $.memCache = MAX_MEMORY_CACHE_SIZE;
    }

    // reset API entry
    $.global.api = {};

    // define some global variable
    $.global.s2t = stringIDToTypeID;
    $.global.c2t = charIDToTypeID;
    $.global.__DEV__ = true;
    $.global.__TEST__ = false;
    $.global.__PROD__ = false;

    // prettier-ignore
    try {
        // polyfill
        // @include './polyfill/json2.jsx'
        // @include './polyfill/String.jsx'
        // @include './polyfill/Array.jsx'
        // @include './polyfill/Object.jsx'

        // utils
        // @include './utils/common/index.jsx'
        // @include './utils/constants.jsx'
        // @include './enums/index.jsx'
        // @include './utils/exception.jsx'
        // @include './utils/externalObjects.jsx'
        // @include './utils/xmp.jsx'
        // @include './utils/EventEmitter.jsx'
        // @include './utils/emitter.jsx'
        // @include './utils/logger.jsx'
        // @include './utils/TypeID.jsx'
        // @include './utils/history.jsx'
        // @include './utils/descriptorInfo.jsx'
        // @include './utils/fs.jsx'
        // @include './utils/application.jsx'
        // @include './utils/window.jsx'
        // @include './utils/font.jsx'
        // @include './utils/layer.jsx'
        // @include './utils/document.jsx'
        // @include './utils/textLayer.jsx'
        // @include './utils/mask.jsx'
        // @include './utils/path.jsx'
        // @include './utils/saveFile.jsx'
        // @include './cleanMetadata.jsx'

        // add listeners
        // @include './events/index.jsx'

        // business logic

    } catch(error) {
        alert('启动插件失败！\n' + $.global.api.exception.getErrorDetails(error));
    }

    if (__PROD__) {
        $.level = 0;
    }
})();
