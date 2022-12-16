(function setup() {
    // enable debug mode
    $.level = 2;
    // forbid to write to readonly property
    $.strict = true;

    // set JSX engin cache 300MB
    var MAX_MEMORY_CACHE_SIZE = 1024 * 1024 * 300;
    // default size is 100k
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
        alert('load JSX modules failed！\n' + $.global.api.exception.getErrorDetails(error));
    }

    if (__PROD__) {
        $.level = 0;
    }
})();
