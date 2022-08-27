api.document = (function () {
    const layerHelper = api.layer;
    var descriptorInfo = api.descriptorInfo;
    var AMLayerKind = api.AMLayerKind;

    /**
     * 获取 id 为给定 id 的文档
     * @param {number} id
     * @returns {Document}
     */
    function getDocumentById(id) {
        if (typeof id !== 'number') {
            throw new TypeError(typeof id + ' is not a number!');
        }

        var documents = Array.from(app.documents);
        for (var i = 0, document; i < documents.length; i++) {
            document = documents[i];
            if (document.id === id) {
                return document;
            }
        }

        return null;
    }

    /**
     * 获取文档 descriptorInfo
     * @param {number} id
     * @param {string} property
     * @returns {ActionDescriptor}
     */
    function getDocumentDesc(id, property) {
        var docRef = new ActionReference();
        var typeofProperty = typeof property;
        if (typeofProperty !== undefined) {
            docRef.putProperty(
                TypeID.property,
                typeofProperty === 'number' ? property : s2t(property),
            );
        }
        docRef.putIdentifier(TypeID.document, id);
        return executeActionGet(docRef);
    }

    /**
     *
     * @param {Document} document
     */
    function getDocumentFileSize(document) {
        return new Number(document.fullName.length / 1024 / 1024);
    }

    /**
     * 检查文档是否一次都没保存过
     * @param {Document} document
     * @returns {boolean}
     */
    function isDocumentSavedOnce(document) {
        try {
            // eslint-disable-next-line no-unused-expressions
            document.fullName;
        } catch (error) {
            return false;
        }
        return true;
    }

    /**
     * 获取文档中所有图层，包括 ArtLayer 和 LayerSet
     * 注意这里的返回的图层顺序是按照图层的渲染顺序，即从下到上
     * !: 对于大的 psd 会很耗时，测试的一个 128mb 的 psd 耗时 1s 左右
     * @param {LayerSet|Document} layerSet
     * @returns {Array<ArtLayer | LayerSet>}
     */
    function getLayers(layerSet, mustVisible) {
        if (mustVisible === undefined) mustVisible = false;
        var children = Array.from(layerSet.layers);
        var layers = [];

        for (var i = children.length - 1, child; i >= 0; i--) {
            child = children[i];
            if (mustVisible && !child.visible) continue;

            if (child.typename === 'LayerSet') {
                layers = layers.concat(getLayers(child, mustVisible));
            } else {
                layers.push(child);
            }
        }

        if (layerSet.typename === 'LayerSet') {
            layers.push(layerSet);
        }

        return layers;
    }

    /**
     * 获取文档中所有 ArtLayer
     * @param {LayerSet} layerSet
     * @returns {ArtLayer[]}
     */
    function getArtLayers(layerSet) {
        var children = Array.from(layerSet.layers);
        var layers = [];

        for (var i = children.length - 1, child; i >= 0; i--) {
            child = children[i];
            if (child.typename === 'LayerSet') {
                layers = layers.concat(getArtLayers(child));
            } else {
                layers.push(child);
            }
        }

        return layers;
    }

    /**
     * 获取所有 Layer 的信息
     * @param {LayerSet | Document} layerSet
     * @returns {LayerInfo[]}
     */
    function getLayersInfo(layerSet, mustVisible) {
        if (mustVisible === undefined) mustVisible = false;
        var layers = getLayers(layerSet, mustVisible);
        var layersInfo = [];
        for (var i = 0, layer; i < layers.length; i++) {
            layer = layers[i];
            layersInfo.push(layerHelper.createLayerInfo(layer));
        }
        return layersInfo;
    }

    /**
     * 获取所有 ArtLayer 的信息
     * @param {LayerSet | Document} layerSet
     * @returns {LayerInfo[]}
     */
    function getArtLayersInfo(layerSet) {
        var layers = getArtLayers(layerSet);
        var layersInfo = [];
        for (var i = 0, layer; i < layers.length; i++) {
            layer = layers[i];
            layersInfo.push(layerHelper.createLayerInfo(layer));
        }
        return layersInfo;
    }

    /**
     * @param {LayerInfo[]} layersInfo
     * @returns {LayerInfo[]}
     */
    function getArtLayersInfoFromLayersInfo(layersInfo) {
        var artLayersInfo = [];
        for (var i = 0; i < layersInfo; i++) {
            if (layersInfo[i].isArtLayer) {
                artLayersInfo.push(layersInfo[i]);
            }
        }
        return artLayersInfo;
    }

    /**
     * 获取当前打开的 psd 中被选中的图层数量
     * @returns {number}
     */
    function getSelectedLayersCount() {
        if (app.documents.length === 0) return 0;

        var selectedLayersReference = new ActionReference();
        selectedLayersReference.putProperty(TypeID.property, TypeID.targetLayersIDs);
        selectedLayersReference.putEnumerated(TypeID.document, TypeID.ordinal, TypeID.targetEnum);
        var desc = executeActionGet(selectedLayersReference);
        var selectedLayersKey = TypeID.targetLayersIDs;
        if (desc.hasKey(selectedLayersKey)) {
            var list = desc.getList(selectedLayersKey);
            return list.count;
        }
        return 0;
    }

    /**
     * 使用 AM 遍历 layer tree
     * @param {(layerDesc: ActionDescriptor) => boolean} visit 返回 false 停止遍历
     * @param {string | string[]} property
     * @param {number} layerKind
     */
    function traverseLayersDesc(visit, property, layerKind) {
        var docRef = new ActionReference();
        docRef.putProperty(TypeID.property, TypeID.numberOfLayers);
        docRef.putIdentifier(TypeID.document, activeDocument.id);
        var docDesc = executeActionGet(docRef);
        var layerCount = docDesc.getInteger(TypeID.numberOfLayers);

        // 索引起始值，会受是否有背景图层影响
        var i = app.activeDocument.layers[app.activeDocument.layers.length - 1].isBackgroundLayer
            ? 0
            : 1;

        // 开始逐级遍历图层index，根据index来获取到图层实例
        var traverseProperty = typeof property !== 'undefined';
        var isProperties = Array.isArray(property);
        var properties = isProperties ? property : [property];
        var propertiesKey = isProperties
            ? properties.map(function (p) {
                  return TypeID[p] || s2t(p);
              })
            : [TypeID[property] || s2t(property)];
        var j, layerRef, layerDesc, _layerKind, propertiesValue, traverseValue;
        for (i; i <= layerCount; i++) {
            // https://community.adobe.com/t5/photoshop-ecosystem-discussions/select-layers-by-kind-script/td-p/11867138
            // 跳过隐藏图层
            traverseValue = undefined;
            layerRef = new ActionReference();
            layerRef.putProperty(TypeID.property, TypeID.layerKind);
            layerRef.putIndex(TypeID.layer, i);
            layerDesc = executeActionGet(layerRef);
            _layerKind = layerDesc.getInteger(TypeID.layerKind);
            if (typeof layerKind == 'number') {
                if (_layerKind !== layerKind) continue;
            } else {
                if (_layerKind === AMLayerKind.HiddenSectionBounder) continue;
            }

            if (traverseProperty) {
                propertiesValue = [];
                for (j = 0; j < properties.length; j++) {
                    layerRef = new ActionReference();
                    layerRef.putProperty(TypeID.property, propertiesKey[j]);
                    layerRef.putIndex(TypeID.layer, i);
                    layerDesc = executeActionGet(layerRef);
                    propertiesValue.push(descriptorInfo.get(layerDesc, properties[j]));
                }
                traverseValue = isProperties ? propertiesValue : propertiesValue[0];
            } else {
                layerRef = new ActionReference();
                layerRef.putIndex(TypeID.layer, i);
                layerDesc = executeActionGet(layerRef);
                traverseValue = layerDesc;
            }

            var isContinue = visit(traverseValue);
            if (isContinue === false) break;
        }
    }

    /**
     * 遍历所有子图层
     * @param {LayerSet} layerSet
     * @param {(layer: Layer) => boolean} visit 返回 false 停止遍历
     */
    function traverseChildLayers(layerSet, visit) {
        /**
         * @param {LayerSet} currentLayerSet
         */
        function traverse(currentLayerSet) {
            var isContinue;
            if (currentLayerSet !== layerSet) {
                isContinue = visit(currentLayerSet);
                if (isContinue === false) return false;
            }

            var layers = Array.from(currentLayerSet.layers);
            for (var i = 0, layer; i < layers.length; i++) {
                layer = layers[i];
                if (layer.typename === 'LayerSet') {
                    if (traverse(layer) === false) return false;
                } else {
                    isContinue = visit(layer);
                    if (isContinue === false) return false;
                }
            }
        }

        traverse(layerSet);
    }

    /**
     * 获取背景图层，目前认为整个画布最多有一个背景图层
     * @param {Document} document
     * @returns {ArtLayer}
     */
    function getBackgroundLayer(document) {
        var backgroundId;
        traverseLayersDesc(
            function (values) {
                var id = values[0];
                var name = values[1];
                if (/【背景】/.test(name)) {
                    backgroundId = id;
                    return false;
                }
            },
            ['layerID', 'name'],
        );

        if (backgroundId !== undefined) {
            return layerHelper.getLayerById(backgroundId, document);
        }
        return null;
    }

    /**
     * 导入图片并变换
     * @param {string} imagePath
     * @param {IImageTransform} transform
     * @param {ArtLayer} beforeLayer
     * @returns {ArtLayer}
     */
    function importImage(imagePath, transform, beforeLayer) {
        var doc = activeDocument;
        var imageFile = new File(imagePath);
        if (!imageFile.exists) {
            throw new Error('The image you want to import is not exists!');
        }
        var imageDoc = app.open(imageFile);

        app.activeDocument = imageDoc;
        var curLayer = imageDoc.layers[0];
        var imageLayer = curLayer.duplicate(
            beforeLayer || doc.layers[0],
            ElementPlacement.PLACEBEFORE,
        );
        imageDoc.close(SaveOptions.DONOTSAVECHANGES);

        app.activeDocument = doc;
        imageLayer.name = imageFile.name;
        layerHelper.transformLayer(imageLayer, transform);
        return activeDocument.activeLayer;
    }

    /**
     * 保存文档
     * @param {number} id
     */
    function saveDocument(id) {
        if (activeDocument.id !== id) {
            var document = getDocumentById(id);
            if (document) {
                app.activeDocument = document;
            } else {
                return;
            }
        }

        var isDirty = getDocumentDesc(id, TypeID.isDirty).getBoolean(TypeID.isDirty);
        if (!isDirty) return;

        var desc = new ActionDescriptor();
        executeAction(TypeID.save, desc, DialogModes.NO);
    }

    /**
     * 复制文档
     * @param {number} id 被复制的文档 id
     * @param {string} documentCopyName 生成的文档名称
     */
    function duplicateDocument(id, documentCopyName) {
        if (activeDocument.id !== id) {
            app.activeDocument = getDocumentById(id);
        }
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(TypeID.document, TypeID.ordinal, TypeID.first);
        desc.putReference(TypeID.null, ref);
        desc.putString(TypeID.name, documentCopyName);
        executeAction(TypeID.duplicate, desc, DialogModes.NO);
    }

    function closeDocument(id) {
        saveDocument(id);
        var desc = new ActionDescriptor();
        desc.putBoolean(TypeID.forceNotify, false);
        executeAction(TypeID.close, desc, DialogModes.NO);
    }

    return {
        getDocumentById: getDocumentById,
        getDocumentDesc: getDocumentDesc,
        getDocumentFileSize: getDocumentFileSize,
        isDocumentSavedOnce: isDocumentSavedOnce,
        getLayers: getLayers,
        getArtLayers: getArtLayers,
        getLayersInfo: getLayersInfo,
        getArtLayersInfo: getArtLayersInfo,
        getArtLayersInfoFromLayersInfo: getArtLayersInfoFromLayersInfo,
        getSelectedLayersCount: getSelectedLayersCount,
        traverseLayersDesc: traverseLayersDesc,
        getBackgroundLayer: getBackgroundLayer,
        traverseChildLayers: traverseChildLayers,
        importImage: importImage,
        saveDocument: saveDocument,
        duplicateDocument: duplicateDocument,
        closeDocument: closeDocument,
    };
})();
