api.layer = (function () {
    var descriptorInfo = api.descriptorInfo;
    const emitter = api.emitter;
    var _ = api._;
    var AMLayerKind = api.AMLayerKind;

    /**
     * 是否为空图层，即没有可见像素
     * @param {number} layerId
     * @returns {boolean}
     */
    function isEmpty(layerId) {
        /** @type {ActionDescriptor} */
        var LayerBounds = getLayerDesc(layerId, TypeID.bounds).getObjectValue(TypeID.bounds);
        if (!LayerBounds.hasKey(TypeID.width)) return true;

        var width = LayerBounds.getDouble(TypeID.width);
        var height = LayerBounds.getDouble(TypeID.height);
        return _.eq(width, 0) && _.eq(height, 0);
    }

    /**
     * 判断当前激活文档是否存在图层
     * @param {number} id
     * @returns
     */
    function isExisted(id) {
        try {
            var ref = new ActionReference();
            ref.putIdentifier(TypeID.layer, id);
            executeActionGet(ref);
        } catch (error) {
            return false;
        }
        return true;
    }

    /**
     * 判断一个 Layer 是不是 Document 的唯一子图层
     * @param {Layer} layer
     * @returns {boolean}
     */
    function isDocumentOnlyChild(layer) {
        return layer.parent instanceof Document && layer.parent.layers.length === 1;
    }

    /**
     * 取消图层选中
     */
    function cancelSelection() {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(TypeID.layer, TypeID.ordinal, TypeID.targetEnum);
        desc.putReference(TypeID.null, ref);
        executeAction(s2t('selectNoLayers'), desc, DialogModes.NO);
    }

    /**
     * @param {number} layerId
     * @returns {boolean}
     */
    function isVisible(layerId) {
        return getLayerProperty(layerId, 'visible', false);
    }

    /**
     * @param {number} layerId
     * @returns {boolean}
     */
    function isArtboard(layerId) {
        return getLayerProperty(layerId, 'artboardEnabled', false);
    }

    const AdjustmentLayerKinds = [
        LayerKind.BRIGHTNESSCONTRAST,
        LayerKind.LEVELS,
        LayerKind.CURVES,
        LayerKind.EXPOSURE,

        LayerKind.VIBRANCE,
        LayerKind.HUESATURATION,
        LayerKind.COLORBALANCE,
        LayerKind.BLACKANDWHITE,
        LayerKind.PHOTOFILTER,
        LayerKind.CHANNELMIXER,
        LayerKind.COLORLOOKUP,

        LayerKind.INVERSION,
        LayerKind.POSTERIZE,
        LayerKind.THRESHOLD,
        LayerKind.GRADIENTMAP,
        LayerKind.SELECTIVECOLOR,
    ];

    /**
     * @param {Layer|number} layer
     */
    function isLayerSet(layer) {
        if (typeof layer === 'number') {
            var layerId = layer;
            return getLayerProperty(layerId, 'layerKind') === api.AMLayerKind.kSmartObjectSheet;
        }
        return layer.typename === 'LayerSet';
    }

    /**
     * 判断图层是否为调节图层
     * @param {Layer} layer
     * @returns {boolean}
     */
    function isAdjustmentLayer(layer) {
        if (layer.typename === 'LayerSet') return false;
        return AdjustmentLayerKinds.includes(layer.kind);
    }

    var VectorLayerKinks = [LayerKind.SOLIDFILL, LayerKind.GRADIENTFILL, LayerKind.PATTERNFILL];
    var AMVectorLayerKinks = [
        AMLayerKind.VectorSheet,
        AMLayerKind.SolidColorSheet,
        AMLayerKind.GradientSheet,
        AMLayerKind.PatternSheet,
    ];
    /**
     * 判断一个图层是否是矢量图层
     * @param {Layer} layer
     * @returns {boolean}
     */
    function isVectorLayer(layer) {
        if (typeof layer === 'number') {
            var layerId = layer;
            return AMVectorLayerKinks.includes(getLayerProperty(layerId, 'layerKind'));
        }

        return VectorLayerKinks.includes(layer.kind);
    }

    function isSmartObject(layer) {
        return layer.kind === LayerKind.SMARTOBJECT;
    }

    /**
     * 判断图层是否是文字图层
     * @param {ArtLayer} layer
     * @returns {boolean}
     */
    function isTextLayer(layer) {
        return layer.kind === LayerKind.TEXT;
    }

    /**
     * 检查图层类型
     * @param {Layer} layer
     * @returns {LayerTypeObjet}
     */
    function checkLayerType(layer) {
        var isLayerSet = layer.typename === 'LayerSet';
        var isArtLayer = !isLayerSet;
        var layerKind = layer.kind;
        return {
            isLayerSet: isLayerSet,
            isArtLayer: isArtLayer,
            isSmartObject: isArtLayer && layerKind === LayerKind.SMARTOBJECT,
            isAdjustmentLayer: isArtLayer && AdjustmentLayerKinds.includes(layerKind),
            isTextLayer: isArtLayer && layerKind === LayerKind.TEXT,
            isVectorLayer: isArtLayer && VectorLayerKinks.includes(layerKind),
        };
    }

    /**
     * 通过图层 id 获取图层
     * @param {number} id
     * @param {Document} document
     * @returns {Layer}
     */
    function getLayerById(layerId, document) {
        if (app.documents.length === 0) return null;

        if (document === undefined) document = activeDocument;
        var originActiveDocument = activeDocument;
        if (document !== activeDocument) app.activeDocument = document;

        /** @type {ArtLayer} */
        var originLayer = activeDocument.activeLayer;
        if (!originLayer) return null;
        if (originLayer.id === layerId) return originLayer;

        selectLayerById(layerId);
        var layer = activeDocument.activeLayer;
        selectLayerById(originLayer.id);
        if (activeDocument !== originActiveDocument) {
            app.activeDocument = originActiveDocument;
        }
        return layer;
    }

    /**
     * 获取图层名和给定名称相符的第一个图层
     * @param {string|RegExp} name
     * @param {Document} document
     * @returns {Layer[]}
     */
    function getLayersByName(name, document) {
        var searchedLayers = [];

        var children = Array.from(document.layers);
        for (var i = children.length - 1, child; i >= 0; i--) {
            child = children[i];
            if (child.typename === 'LayerSet') {
                searchedLayers = searchedLayers.concat(getLayersByName(name, child));
            }

            var isMatch = typeof name === 'string' ? name === child.name : name.test(child.name);
            if (isMatch) searchedLayers.push(child);
        }

        return searchedLayers;
    }

    /**
     * 获取图层名和给定名称匹配的第一个图层
     * 遍历顺序是又底层向高层
     * @param {string|RegExp} name
     * @param {Document} document
     * @returns {Layer}
     */
    function getLayerByName(name, document) {
        var children = Array.from(document.layers);
        for (var i = children.length - 1, child; i >= 0; i--) {
            child = children[i];
            if (child.typename === 'LayerSet') {
                var foundLayer = getLayersByName(name, child);
                if (foundLayer) return foundLayer;
            }

            var isMatch = typeof name === 'string' ? name === child.name : name.test(child.name);
            if (isMatch) return child;
        }
        return null;
    }

    /**
     * 获取图层名和给定名称匹配的最后一个图层
     * @param {string|RegExp} name
     * @param {Document} document
     * @returns {Layer}
     */
    function getLastLayerByName(name, document) {
        var children = Array.from(document.layers);
        for (var i = children.length - 1, child; i >= 0; i--) {
            child = children[i];
            var isMatch = typeof name === 'string' ? name === child.name : name.test(child.name);
            if (isMatch) return child;

            if (child.typename === 'LayerSet') {
                return getLayersByName(name, child);
            }
        }
        return null;
    }

    /**
     * 把一个图层移动到另一个图层的位置
     * @param {number} fromLayerId
     * @param {number} toLayerItemIndex
     */
    function moveLayer(fromLayerId, toLayerItemIndex) {
        var desc = new ActionDescriptor();
        var movedRef = new ActionReference();
        movedRef.putIdentifier(TypeID.layer, fromLayerId);
        desc.putReference(TypeID.null, movedRef);

        var toRef = new ActionReference();
        toRef.putIndex(TypeID.layer, toLayerItemIndex);
        desc.putReference(s2t('to'), toRef);

        desc.putBoolean(s2t('adjustment'), false);
        var list = new ActionList();
        list.putInteger(22);

        executeAction(s2t('move'), desc, DialogModes.NO);
    }

    /**
     * 选中图层
     * @param {number} id
     */
    function selectLayerById(id) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putIdentifier(TypeID.layer, id);
        desc.putReference(TypeID.null, ref);
        desc.putBoolean(s2t('makeVisible'), false);
        executeAction(s2t('select'), desc, DialogModes.NO);
    }

    /**
     * 多选图层
     * @param {number[]} ids
     */
    function multipleSelect(ids) {
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putIdentifier(TypeID.layer, id);
            desc.putReference(TypeID.null, ref);
            desc.putEnumerated(
                s2t('selectionModifier'),
                s2t('selectionModifierType'),
                s2t('addToSelection'),
            );
            desc.putBoolean(s2t('makeVisible'), true);
            executeAction(s2t('select'), desc, DialogModes.NO);
        }
    }

    /**
     * 将图层转换成智能对象
     * @param {number} id
     */
    function convertToSmartObject(ids) {
        if (Array.isArray(ids)) {
            cancelSelection();
            multipleSelect(ids);
        } else {
            selectLayerById(ids);
        }
        executeAction(s2t('newPlacedLayer'), undefined, DialogModes.NO);
    }

    var StyleKeys = [
        'dropShadow',
        'innerShadow',
        'outerGlow',
        'innerGlow',
        'bevelEmboss',
        'chromeFX',
        'solidFill',
        'gradientFill',
        'patternFill',
        'frameFX',
    ];
    /**
     * 获取图层样式
     * @param {number} layerId
     * @param {boolean} filterEnabled
     */
    function getEffects(layerId, filterEnabled) {
        var layerEffects;
        var layerFXVisible;
        if (typeof layerId === 'number') {
            layerEffects = getLayerProperty(layerId, ['layerEffects']);
            layerFXVisible = getLayerProperty(layerId, ['layerFXVisible']);
        } else {
            var layerDescInfo = layerId;
            layerEffects = layerDescInfo.layerEffects;
            layerFXVisible = layerDescInfo.layerFXVisible;
        }

        var styles = {};
        var globalEnable = layerFXVisible !== false;

        if (layerEffects) {
            for (var i = 0, enabled; i <= StyleKeys.length; i++) {
                var styleKey = StyleKeys[i];
                if (styleKey in layerEffects) {
                    enabled = !!(globalEnable && layerEffects[styleKey].enabled);
                    if (filterEnabled) {
                        if (enabled) {
                            styles[styleKey] = enabled;
                        }
                    } else {
                        styles[styleKey] = enabled;
                    }
                }
            }
        }
        return styles;
    }

    /**
     * 使用 AM 删除图层
     * @param {number | Layer} id
     */
    function deleteLayer(id) {
        try {
            var ref = new ActionReference();
            ref.putIdentifier(TypeID.layer, id);
            var desc = new ActionDescriptor();
            desc.putReference(TypeID.null, ref);
            executeAction(s2t('delete'), desc, DialogModes.NO);
        } catch (ignore) {
            // 两种情况删除不了：
            // 1: 被锁定了
            // 2：是 Document 的唯一子图层，PS 会确保 psd 至少有一个图层
        }
    }

    /**
     * 返回给定文档的选中图层
     * 不直接用 activeDocument.activeLayer 是因为
     * 1. 当取消选中时，这个属性获取的是之前选中的图层
     * 2. 当选中多个图层时也应认为没选中图层
     * @param {Document}
     * @returns {Layer}
     */
    function getActiveLayer(document) {
        if (app.documents.length === 0) return null;

        document = document || activeDocument;
        if (!document.activeLayer) return null;

        var selectedIdsProperty = 'targetLayersIDs';
        /** @type {ActionDescriptor} */
        var docDesc = api.document.getDocumentDesc(document.id, selectedIdsProperty);
        if (
            !docDesc.hasKey(TypeID.targetLayersIDs) ||
            docDesc.getList(TypeID.targetLayersIDs).count !== 1
        ) {
            return null;
        }

        return document.activeLayer;
    }

    /**
     * 获取当前选中的图层的 id
     * @param {Document} document
     * @returns {number}
     */
    function getActiveLayerId(document) {
        var activeLayer = getActiveLayer(document);
        return activeLayer ? activeLayer.id : null;
    }

    /**
     * 获取一个图层在父图层中的下标
     * @param {Layer} layer
     * @returns {number}
     */
    function getIndexInGroup(layer) {
        var itemIndex = layer.itemIndex;
        var layers = layer.parent.layers;
        var length = layers.length;

        function getIndex(reversedIndex) {
            return length - reversedIndex - 1;
        }

        var left = 0;
        var right = length - 1;
        var mid, currentLayer, currentItemIndex;
        while (left <= right) {
            mid = Math.floor((left + right) / 2);
            currentLayer = layers[getIndex(mid)];
            currentItemIndex = currentLayer.itemIndex;
            if (itemIndex === currentItemIndex) {
                return getIndex(mid);
            }

            if (itemIndex > currentItemIndex) {
                left = mid + 1;
            } else {
                right = currentLayer.typename === 'LayerSet' ? mid : mid - 1;
            }
        }
    }

    /**
     * 获取给定图层同级的下面一层的图层
     * @param {Layer} layer
     * @returns {Layer}
     */
    function getBelowLayer(layer) {
        /** @type {LayerSet} */
        var parent = layer.parent;
        var brothers = parent.layers;
        var layerIndex = getIndexInGroup(layer);
        if (layerIndex + 1 < brothers.length) {
            return brothers[layerIndex + 1];
        }
        return null;
    }

    /**
     * 获取给定图层下面所有同级图层
     * @param {Layer} layer
     * @returns {Layer[]}
     */
    function getBelowLayers(layer) {
        /** @type {LayerSet} */
        var parent = layer.parent;
        var brothers = Array.from(parent.layers);
        var layerIndex = getIndexInGroup(layer);
        var belowLayers = [];
        for (var i = layerIndex + 1; i < brothers.length; i++) {
            belowLayers.push(brothers[i]);
        }
        return belowLayers;
    }

    /**
     * 获取图层的 ActionDescriptor
     * @param {number} id
     * @param {string} property
     * @returns {ActionDescriptor}
     */
    function getLayerDesc(id, property) {
        var layerReference = new ActionReference();
        var typeofProperty = typeof property;
        if (typeofProperty !== 'undefined') {
            layerReference.putProperty(
                TypeID.property,
                typeofProperty === 'number' ? property : s2t(property),
            );
        }
        layerReference.putIdentifier(TypeID.layer, id);
        return executeActionGet(layerReference);
    }

    /**
     * 获取图层某个属性路径的值
     * @param {number | Layer} layerId
     * @param {StringID | Array<StringID|number>} path
     * @param {any} defaultValue
     */
    function getLayerProperty(layerId, path, defaultValue) {
        if (typeof layerId === 'object') {
            var layer = layerId;
            layerId = layer.id;
        }

        var propPath = Array.isArray(path) ? path : _.parsePropPathStrToArray(path);
        if (propPath.length === 0) {
            throw new Error('At least one property, but you pass ' + JSON.stringify(path));
        }

        var property = propPath[0];
        var layerDesc = api.layer.getLayerDesc(layerId, property);
        return descriptorInfo.get(layerDesc, propPath, defaultValue);
    }

    /**
     * 栅格化图层
     * @param {number} layerId
     */
    function rasterizeLayer(layerId) {
        // 组需要先转智能对象
        if (isLayerSet(layerId)) {
            convertToSmartObject(layerId);
            // 转为只能对象后原本的 layer 对象就失效了
            layerId = activeDocument.activeLayer.id;
        }

        var ref = new ActionReference();
        ref.putIdentifier(TypeID.layer, layerId);
        var desc = new ActionDescriptor();
        desc.putReference(TypeID.null, ref);
        // 把图层样式一并栅格化
        desc.putEnumerated(TypeID.what, TypeID.rasterizeItem, TypeID.layerStyle);
        executeAction(TypeID.rasterizeLayer, desc, DialogModes.NO);
    }

    /**
     * 获取图层实际可见区域
     * @param {number} id
     * @param {Document} document
     * @returns {Bounds}
     */
    function getLayerVisibleBounds(id, document) {
        var layerReference = new ActionReference();
        layerReference.putProperty(TypeID.property, s2t('bounds'));
        layerReference.putIdentifier(TypeID.layer, id);
        var boundsDesc = executeActionGet(layerReference).getObjectValue(s2t('bounds'));
        var left = boundsDesc.getDouble(s2t('left'));
        var right = boundsDesc.getDouble(s2t('right'));
        var top = boundsDesc.getDouble(s2t('top'));
        var bottom = boundsDesc.getDouble(s2t('bottom'));

        if (left >= document.width || right <= 0 || top >= document.height || bottom <= 0)
            return null;

        var bounds = {
            left: Math.max(left, 0),
            right: Math.min(right, document.width),
            top: Math.max(top, 0),
            bottom: Math.min(bottom, document.height),
        };

        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        return bounds;
    }

    /**
     * 选中图层中透明像素区域
     * @returns {boolean}
     */
    function selectTransparency() {
        var desc = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));
        desc.putReference(charIDToTypeID('null'), ref1);
        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Trsp'));
        desc.putReference(charIDToTypeID('T   '), ref2);
        desc.putBoolean(charIDToTypeID('Invr'), true);
        try {
            executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * 判断一个图层是否包含透明像素
     * @param {Layer} layer
     * @returns {boolean}
     */
    function containsTransparentPixel(layer) {
        activeDocument.activeLayer = layer;
        selectTransparency();
        try {
            // eslint-disable-next-line no-unused-expressions
            app.activeDocument.selection.bounds;
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * @param {Layer} layer
     * @returns {LayerInfo}
     */
    function createLayerInfo(layer) {
        var typeObj = checkLayerType(layer);
        return Object.assign({ layer: layer }, typeObj);
    }

    /**
     * 对图层进行变换
     * @param {ArtLayer} layer
     * @param {IImageTransform} transform
     */
    function transformLayer(layer, transform) {
        if (layer.bounds[2].as('px') === 0 && layer.bounds[3].as('px') === 0) {
            emitter.error('不能对空图层变换矩阵');
            return;
        }

        // 平移
        if (typeof transform.x === 'number' && typeof transform.y === 'number') {
            // 原点为包围盒左上角
            layer.translate(transform.x, transform.y);
        } else if (!(typeof transform.x !== 'number' && typeof transform.y !== 'number')) {
            throw new TypeError('transform.x and transform.y should be passed together');
        }

        // 缩放
        if (typeof transform.scaleX === 'number' && typeof transform.scaleY === 'number') {
            layer.resize(transform.scaleX * 100, transform.scaleY * 100);
        } else if (
            !(typeof transform.scaleX !== 'number' && typeof transform.scaleY !== 'number')
        ) {
            throw new TypeError('transform.x and transform.y should be passed together');
        }

        // 旋转
        if (transform.rotate) {
            throw new TypeError('pass transform.angle instead!');
        }

        if (transform.angle) {
            layer.rotate(transform.angle);
        }
    }

    return {
        isEmpty: isEmpty,
        isArtboard: isArtboard,
        isExisted: isExisted,
        isDocumentOnlyChild: isDocumentOnlyChild,
        isVisible: isVisible,
        getLayerById: getLayerById,
        getLayerByName: getLayerByName,
        getLastLayerByName: getLastLayerByName,
        getLayersByName: getLayersByName,
        moveLayer: moveLayer,
        deleteLayer: deleteLayer,
        AdjustmentLayerKinds: AdjustmentLayerKinds,
        isAdjustmentLayer: isAdjustmentLayer,
        isSmartObject: isSmartObject,
        isVectorLayer: isVectorLayer,
        isTextLayer: isTextLayer,
        checkLayerType: checkLayerType,
        selectLayerById: selectLayerById,
        convertToSmartObject: convertToSmartObject,
        getEffects: getEffects,
        getActiveLayer: getActiveLayer,
        getActiveLayerId: getActiveLayerId,
        cancelSelection: cancelSelection,
        getBelowLayer: getBelowLayer,
        getBelowLayers: getBelowLayers,
        getLayerDesc: getLayerDesc,
        getLayerProperty: getLayerProperty,
        rasterizeLayer: rasterizeLayer,
        getLayerVisibleBounds: getLayerVisibleBounds,
        containsTransparentPixel: containsTransparentPixel,
        createLayerInfo: createLayerInfo,
        selectTransparency: selectTransparency,
        transformLayer: transformLayer,
    };
})();
