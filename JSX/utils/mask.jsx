/* eslint-disable no-unused-expressions */

api.mask = (function () {
    const layerHelper = api.layer;

    /**
     * Delete Empty Masks, including Vector Mask, Layer Mask, Filter Mask
     * @see https://community.adobe.com/t5/photoshop-ecosystem-discussions/delete-empty-masks-layer-masks-vector-masks-and-filter-masks/td-p/11022722
     * @param {ArtLayer} layer
     */
    function removeEmptyMasks(layer) {
        removeEmptyUserMask(layer);
        removeFilterMask(layer);
        removeEmptyVectorMask(layer);
        // 移除空图层那一步就已经移除了
        // removeEmptyClippingMask(layer);
    }

    /**
     * @param {number} layerId
     * @return {boolean}
     */
    function removeEmptyUserMask(layerId) {
        var hasUserMask = layerHelper.getLayerProperty(layerId, 'hasUserMask', false);
        if (!hasUserMask) return false;

        layerHelper.selectLayerById(layerId);
        var selectionReference = new ActionReference();
        selectionReference.putProperty(TypeID.channel, TypeID.selection);
        var selectionDescriptor = new ActionDescriptor();
        selectionDescriptor.putReference(TypeID.null, selectionReference);

        var userMaskReference = new ActionReference();
        userMaskReference.putEnumerated(TypeID.channel, TypeID.channel, TypeID.mask);
        userMaskReference.putIdentifier(TypeID.layer, layerId);
        selectionDescriptor.putReference(TypeID.to, userMaskReference);
        executeAction(TypeID.set, selectionDescriptor, DialogModes.NO);

        var userMaskEmpty = true;
        try {
            activeDocument.selection.bounds;
        } catch (error) {
            userMaskEmpty = false;
        }
        if (userMaskEmpty) {
            activeDocument.selection.invert();
            try {
                activeDocument.selection.bounds;
                userMaskEmpty = false;
            } catch (ignore) {}
            activeDocument.selection.deselect();
        }

        if (!userMaskEmpty) return false;

        try {
            var deleteDescriptor = new ActionDescriptor();
            deleteDescriptor.putReference(TypeID.null, userMaskReference);
            executeAction(TypeID.delete, deleteDescriptor, DialogModes.NO);
        } catch (ignore) {
            return false;
        }

        return true;
    }

    /**
     * @param {number} layerId
     * @return {boolean}
     */
    function removeFilterMask(layerId) {
        var hasFilterMask = layerHelper.getLayerProperty(layerId, 'hasFilterMask', false);
        if (!hasFilterMask) return false;

        layerHelper.selectLayerById(layerId);

        var selectionReference = new ActionReference();
        selectionReference.putProperty(TypeID.channel, TypeID.selection);
        var selectionDescriptor = new ActionDescriptor();
        selectionDescriptor.putReference(TypeID.null, selectionReference);

        var filterMaskReference = new ActionReference();
        filterMaskReference.putEnumerated(TypeID.channel, TypeID.channel, TypeID.filterMask);
        filterMaskReference.putIdentifier(TypeID.layer, layerId);
        selectionDescriptor.putReference(TypeID.to, filterMaskReference);
        executeAction(TypeID.set, selectionDescriptor, DialogModes.NO);

        var filterMaskEmpty = true;
        try {
            activeDocument.selection.bounds;
        } catch (error) {
            filterMaskEmpty = false;
        }
        if (filterMaskEmpty) {
            activeDocument.selection.invert();
            try {
                activeDocument.selection.bounds;
                filterMaskEmpty = false;
            } catch (ignore) {}
            activeDocument.selection.deselect();
        }
        if (!filterMaskEmpty) return false;

        try {
            var deleteDescriptor = new ActionDescriptor();
            deleteDescriptor.putReference(TypeID.null, filterMaskReference);
            executeAction(TypeID.delete, deleteDescriptor, DialogModes.NO);
        } catch (ignore) {
            return false;
        }

        return true;
    }

    /**
     * @param {number} layerId
     * @return {boolean}
     */
    function removeEmptyVectorMask(layerId) {
        var hasVectorMask =
            !layerHelper.isVectorLayer(layerId) &&
            layerHelper.getLayerProperty(layerId, 'hasVectorMask', false);
        if (!hasVectorMask) return false;

        var vectorMaskEmpty = layerHelper.getLayerProperty(layerId, 'vectorMaskEmpty', false);
        if (!vectorMaskEmpty) return false;

        try {
            var vectorMaskReference = new ActionReference();
            vectorMaskReference.putEnumerated(TypeID.path, TypeID.path, TypeID.vectorMask);
            vectorMaskReference.putIdentifier(TypeID.layer, layerId);
            var deleteDescriptor = new ActionDescriptor();
            deleteDescriptor.putReference(TypeID.null, vectorMaskReference);
            executeAction(TypeID.delete, deleteDescriptor, DialogModes.NO);
        } catch (ignore) {
            return false;
        }

        return true;
    }

    /**
     * @param {ArtLayer} layer
     * @return {boolean}
     */
    // eslint-disable-next-line no-unused-vars
    function removeEmptyClippingMask(layer) {
        var clippingLayer = layerHelper.getBelowLayer(layer);
        if (hasClippingMask(layer) && layerHelper.isEmpty(clippingLayer.id)) {
            clippingLayer.remove();
            return true;
        }
        return false;
    }

    function hasLayerMask(id) {
        return layerHelper.getLayerProperty(id, 'hasUserMask', false);
    }

    function hasVectorMask(layerId) {
        return (
            !layerHelper.isVectorLayer(layerId) &&
            layerHelper.getLayerProperty(layerId, 'hasVectorMask', false)
        );
    }

    function hasFilterMask(id) {
        return layerHelper.getLayerProperty(id, 'hasFilterMask', false);
    }

    /**
     * @param {ArtLayer} layer
     */
    function hasClippingMask(layer) {
        return !layerHelper.isAdjustmentLayer(layer) && layer.grouped;
    }

    /**
     * @param {number} layerId
     */
    function rasterizeVectorMask(layerId) {
        layerHelper.selectLayerById(layerId);
        var ref = new ActionReference();
        ref.putIdentifier(TypeID.layer, layerId);
        var desc = new ActionDescriptor();
        desc.putReference(TypeID.null, ref);
        desc.putEnumerated(TypeID.what, TypeID.rasterizeItem, TypeID.vectorMask);
        executeAction(TypeID.rasterizeLayer, desc, DialogModes.NO);
    }

    return {
        removeEmptyMasks: removeEmptyMasks,
        hasLayerMask: hasLayerMask,
        hasVectorMask: hasVectorMask,
        hasFilterMask: hasFilterMask,
        hasClippingMask: hasClippingMask,
        rasterizeVectorMask: rasterizeVectorMask,
    };
})();
