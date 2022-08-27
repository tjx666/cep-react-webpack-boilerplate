interface API {
    emitter: Emitter;
    document: {
        traverseLayersDesc(visit: (layerDesc: ActionDescriptor) => void, property: string): void;
        traverseChildLayers(
            layerSet: LayerSet,
            visit: (layer: Layer | LayerSet) => boolean | undefined,
        ): void;
    };
    layer: {
        getLayerProperty(
            layerId: number | Layer,
            path: StringID | Array<StringID | number>,
            defaultValue: any,
        ): any;
    };
    logger: {
        debug: (...args: any[]) => void;
        info: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        error: (...args: any[]) => void;
        section: (title: any) => void;
    };
    mark: {
        Marks: Marks;
    };
}

var api: API;

interface Emitter {
    on: (eventName: string, callback: EmitResponse) => void;
    emit: (eventName: string, data: any, onResponse: EmitResponse) => void;
    webEmit: (eventName: string, data: any) => void;
    createResponse: (code?: number, data?: any, message?: string) => ResponseData;
    message: (content: string) => void;
}

interface LayerTypeObjet {
    isLayerSet: boolean;
    isArtboard: boolean;
    isArtLayer: boolean;
    isSmartObject: boolean;
    isAdjustmentLayer: boolean;
    isVectorLayer: boolean;
    isTextLayer: boolean;
}

type LayerInfo = {
    layer: LayerSet & ArtLayer;
} & LayerTypeObjet;

type ArtLayerInfo = {
    layer: ArtLayer;
} & LayerTypeObjet;

type IImageTransform = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    angle: number;
};

var __DEV__: boolean;
var __TEST__: boolean;
var __PROD__: boolean;
