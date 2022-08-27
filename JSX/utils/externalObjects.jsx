/**
 * 加载外部库
 */
(function () {
    var loaded = false;

    function loadExternalObjects() {
        if (loaded) return;

        if (typeof CSXSEvent === 'undefined') {
            var plugPlugLibPath = 'lib:PlugPlugExternalObject';
            try {
                new ExternalObject(plugPlugLibPath);
                if (typeof CSXSEvent === 'undefined') {
                    throw new Error('Class CSXSEvent is undefined!');
                }
            } catch (e) {
                $.writeln(e.message || 'Load ExternalObject: ' + plugPlugLibPath + ' failed!');
                return;
            }
        }

        if (typeof XMPMeta === 'undefined') {
            var XMPLibPath = 'lib:AdobeXMPScript';
            try {
                new ExternalObject(XMPLibPath);
                if (typeof XMPMeta === 'undefined') {
                    throw new Error('Class XMPMeta is undefined!');
                }
            } catch (e) {
                $.writeln(e.message || 'Load ExternalObject: ' + XMPLibPath + ' failed!');
                return;
            }
        }

        loaded = true;
    }
    // Note: windows 下，在打开插件的状态下退出 PS，再打开 PS 就会加载不到
    // Note: 原因应该是打开的时候如果 PS 插件立即加载，那个时候 PS 外部库还没被 PS 加载
    loadExternalObjects();
    api.loadExternalObjects = loadExternalObjects;
})();
