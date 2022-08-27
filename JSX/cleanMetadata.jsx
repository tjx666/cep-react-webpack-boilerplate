api.cleanDocumentMetadata = (function () {
    const docHelper = api.document;

    /**
     * 清除文档自身的元数据
     * @param {Document} document
     */
    function clearDocumentSelfMetaData(document) {
        var xmpMetadata = document.xmpMetadata;
        var xmp = new XMPMeta(xmpMetadata.rawData);
        xmp.deleteProperty(XMPConst.NS_PHOTOSHOP, 'DocumentAncestors');
        xmpMetadata.rawData = xmp.serialize();
    }

    /**
     * 打开智能对象，这时候 activeDocument 就是智能对象图层了
     * @param {ArtLayer} smartObjectLayer
     */
    function openSmartObjectLayer(smartObjectLayer) {
        activeDocument.activeLayer = smartObjectLayer;
        var desc = new ActionDescriptor();
        app.executeAction(TypeID.placedLayerEditContents, desc, DialogModes.NO);
    }

    /**
     * 递归清除所有图层的元数据
     * @param {Document} doc
     * @param {Document} mainDocument 表示最开始处理的文档
     */
    function cleanLayersMetadata(doc, mainDocument) {
        var layers = Array.from(doc.layers);
        for (var layer, i = 0; i < layers.length; i++) {
            layer = layers[i];
            if (layer.typename === 'LayerSet') {
                cleanLayersMetadata(layer, mainDocument);
            } else {
                if (layer.kind === LayerKind.SMARTOBJECT) {
                    openSmartObjectLayer(layer);
                    if (activeDocument.activeLayer === layer) {
                        continue;
                    }
                    // 对智能对象文档递归处理
                    cleanDocumentMetadata(activeDocument, mainDocument);
                }
            }
        }
    }

    /**
     * 参考 https://github.com/julysohu/photoshop_deep_cleaner
     * @param {Document} document
     * @param {Document} mainDocument
     * @param {boolean} [cleanSmartObject=true]
     * @returns {number} 优化体积后 mainDocument 的大小，单位 mb
     */
    function cleanDocumentMetadata(document, mainDocument, cleanSmartObject) {
        // 清除当前文档的元数据
        clearDocumentSelfMetaData(document);
        if (cleanSmartObject !== false) {
            cleanLayersMetadata(document, mainDocument);
        }

        // 关闭打开的智能对象文档
        if (activeDocument !== mainDocument) {
            docHelper.saveDocument(activeDocument.id);
            activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        } else {
            docHelper.saveDocument(activeDocument.id);
        }

        return new Number((activeDocument.fullName.length / 1024 / 1024).toFixed(3));
    }

    return cleanDocumentMetadata;
})();
