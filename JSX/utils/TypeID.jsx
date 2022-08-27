$.global.TypeID = (function () {
    // // prettier-ignore
    var properties = [
        'itemIndex',
        'null',
        'ordinal',
        'property',
        'set',
        'targetEnum',
        'to',

        'placedLayerEditContents',
        'channel',
        'close',
        'document',
        'duplicate',
        'forceNotify',
        'path',
        'rasterizeItem',
        'rasterizeLayer',
        'targetLayersIDs',
        'filterMask',
        'vectorMask',
        'what',
        'selection',
        'first',
        'mask',
        'numberOfLayers',
        'isDirty',
        'save',

        'bounds',
        'left',
        'top',
        'width',
        'height',
        'color',
        'count',
        'delete',
        'hasFilterMask',
        'hasUserMask',
        'hasVectorMask',
        'layer',
        'layerStyle',
        'layerEffects',
        'layerFXVisible',
        'layerID',
        'layerKind',
        'mode',
        'name',
        'opacity',
        'vectorMaskEmpty',
        'visible',
    ];
    var TypeID = {};
    for (var i = 0, len = properties.length; i < len; i++) {
        var property = properties[i];
        if (!(property in properties)) {
            TypeID[property] = s2t(property);
        }
    }
    return TypeID;
})();
