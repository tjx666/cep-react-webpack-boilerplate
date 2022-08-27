/**
 * 本地化存储工具，数据是和 psd 绑定的
 */
api.xmp = (function () {
    var namespace = 'Gaodingboilerplate';

    function init() {
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if (!schemaNS) {
            schemaNS = XMPMeta.registerNamespace(namespace, namespace);
        }
    }
    init();

    /**
     * @param {string} property
     * @param {Document} [document]
     * @returns {string}
     */
    function get(property, document) {
        if (typeof document === 'undefined') {
            document = activeDocument;
        }

        var metaData = new XMPMeta(document.xmpMetadata.rawData);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        var metaValue = metaData.getProperty(schemaNS, property);
        if (!metaValue) {
            return undefined;
        }

        return metaValue.value;
    }

    /**
     * @param {string} property
     * @param {string} value
     * @param {Document} [document]
     */
    function set(property, value, document) {
        if (typeof document === 'undefined') {
            document = activeDocument;
        }

        if (typeof value !== 'string') {
            throw new TypeError('value must be string, but you pass ' + typeof value);
        }

        var metaData = new XMPMeta(document.xmpMetadata.rawData);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if (schemaNS) {
            metaData.setProperty(schemaNS, property, value);
            document.xmpMetadata.rawData = metaData.serialize();
        }
    }

    /**
     * @param {string} property
     * @param {Document} [document]
     */
    function del(property, document) {
        if (typeof document === 'undefined') {
            document = activeDocument;
        }

        var metaData = new XMPMeta(document.xmpMetadata.rawData);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if (schemaNS) {
            metaData.deleteProperty(schemaNS, property);
            document.xmpMetadata.rawData = metaData.serialize();
        }
    }

    return {
        get: get,
        set: set,
        del: del,
    };
})();
