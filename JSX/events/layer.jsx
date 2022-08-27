(function () {
    const emitter = api.emitter;
    const docHelper = api.document;
    const layerHelper = api.layer;
    const textLayerHelper = api.textLayer;

    emitter.on('layer.getActiveLayerId', function (data, response) {
        var id = layerHelper.getActiveLayerId();
        response(emitter.createResponse(0, id));
    });

    emitter.on('layer.selectLayer', function (data, response) {
        var documentId = data.documentId;
        var layerId = data.layerId;

        if (app.documents.length === 0) {
            response(emitter.createResponse(1, null, '当前没有打开的文档！'));
            return;
        }

        var document;
        if (documentId == null) {
            document = activeDocument;
        } else {
            document = docHelper.getDocumentById(documentId);
            if (!document) {
                response(emitter.createResponse(2, null, '指定要选中的图层所在的文档不存在！'));
                return;
            }
        }

        var originDocument = app.activeDocument;
        if (document !== activeDocument) {
            app.activeDocument = document;
        }

        if (!layerHelper.isExisted(layerId)) {
            response(emitter.createResponse(3, null, '图层不存在'));
            return;
        }

        try {
            layerHelper.selectLayerById(layerId);
        } catch (error) {
            response(emitter.createResponse(4, error));
            return;
        } finally {
            if (activeDocument !== originDocument) {
                app.activeDocument = originDocument;
            }
        }

        response();
    });

    emitter.on('layer.cancelSelection', function (data, response) {
        layerHelper.cancelSelection();
        response();
    });

    emitter.on('layer.getActiveLayerName', function (data, response) {
        var activeLayer = layerHelper.getActiveLayer();
        response(emitter.createResponse(0, activeLayer ? activeLayer.name : null));
    });

    emitter.on('layer.replaceFont', function (data, response) {
        var document = docHelper.getDocumentById(data.documentId);
        if (document == null) {
            response(emitter.createResponse(1, null, '找不到 id 对应的文档！'));
            return;
        }

        // open the document which need replace font
        app.activeDocument = document;

        // eslint-disable-next-line no-unused-vars
        function replaceLayersFont() {
            try {
                for (var i = 0, layerId, replaceRangeSuccess; i < data.layerIds.length; i++) {
                    layerId = data.layerIds[i];
                    if (!layerHelper.isExisted(layerId)) {
                        continue;
                    }

                    replaceRangeSuccess = textLayerHelper.replaceFont(
                        layerId,
                        document,
                        data.oldFontPostScriptName,
                        data.newFontPostScriptName,
                    );
                    if (!replaceRangeSuccess) {
                        response(
                            emitter.createResponse(
                                2,
                                null,
                                '可能是替换的字体没有包含被替换字体文本的字符集',
                            ),
                        );
                        return;
                    }
                }
            } catch (error) {
                response(emitter.createResponse(-1, error));
                return;
            }
            response();
        }
        document.suspendHistory('替换字体', 'replaceLayersFont()');
    });
})();
