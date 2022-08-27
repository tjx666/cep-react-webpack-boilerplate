import type { RGBColor } from './color';
import type { BlendMode, Orientation, Transform, Wrap } from './base';
import { LayerEffects } from './layerEffects/index';

type Transparency = Array<{
    opacity: number;
    location: number;
    midpoint: number;
}>;

type SolidColor = {
    color: RGBColor;
};

type FillGradient = {
    dither: boolean;
    gradientsInterpolationMethod: string;
    angle: number;
    type: 'linear' | 'radial';
    scale?: number;
    gradient: {
        name: string;
        gradientForm: string;
        interfaceIconFrameDimmed: number;
        colors: Array<{
            color: RGBColor;
            type: string;
            location: number;
            midpoint: number;
        }>;
        transparency: Transparency;
    };
};

type FillPattern = {
    pattern: {
        name: string;
        ID: string;
    };
};

type StrokeGradient = {
    dither: boolean;
    reverse: boolean;
    gradientsInterpolationMethod: string;
    angle: number;
    type: string;
    align: boolean;
    scale: number;
    offset: {
        horizontal: number;
        vertical: number;
    };
    gradient: {
        name: string;
        gradientForm: string;
        interfaceIconFrameDimmed: number;
        colors: Array<{
            color: RGBColor;
            type: string;
            location: number;
            midpoint: number;
        }>;
        transparency: Transparency;
    };
};

type StrokePattern = {
    align: boolean;
    phase: {
        horizontal: number;
        vertical: number;
    };
    scale: number;
    angle: number;
    pattern: {
        name: string;
        ID: string;
    };
};

export declare type LayerDesc = {
    artboardEnabled: boolean;
    background: boolean;
    bounds: Record<'bottom' | 'height' | 'left' | 'right' | 'top' | 'width', number>;
    boundsNoEffects: LayerDesc['bounds'];
    boundsNoMask: LayerDesc['bounds'];
    layer3D?: object;
    channelRestrictions: string[];
    color: string;
    count: number;
    layerFXVisible: boolean;
    name: string;
    /** -1代表无 */
    parentLayerID: number;
    /** 0 ~ 255 */
    opacity: number;
    fillEnabled: boolean;
    /** 0 ~ 255 */
    fillOpacity: number;
    /** 0 ~ 255 */
    filterMaskDensity: number;
    /** 0 ~ 255 */
    filterMaskFeather: number;
    globalAngle: number;
    group: boolean;
    hasFilterMask: boolean;
    hasUserMask: boolean;
    hasVectorMask: boolean;
    itemIndex: number;
    layerID: number;
    mode: BlendMode;
    layerLocking: {
        protectAll: boolean;
        protectArtboardAutonest: boolean;
        protectComposite: boolean;
        protectPosition: boolean;
        protectTransparency: boolean;
    };
    /**
     * |             |          |     |
     * | :---------- | :------- | :-: |
     * | NORMAL      | 普通     |  1  |
     * | TEXT        | 文字     |  3  |
     * | SOLIDFILL   | 形状     |  4  |
     * | SMARTOBJECT | 智能对象 |  5  |
     * | -           | -        |  -  |
     * | \*          | 调整     |  2  |
     * | -           | -        |  -  |
     * | layerset    | 组       |  7  |
     */
    layerKind: number;
    /**
     * 调整图层
     *
     * |                    |             |
     * | ------------------ | ----------- |
     * | COLORBALANCE       | 色彩平衡    |
     * | BLACKANDWHITE      | 黑白        |
     * | BRIGHTNESSCONTRAST | 亮度/对比度 |
     */
    adjustmentType?: string;
    zIndex?: number;
    /** 图层样式 */
    layerEffects?: LayerEffects;
    adjustment?: Array<SolidColor & FillGradient & FillPattern>;
    AGMStrokeStyleInfo: {
        strokeStyleVersion: number;
        strokeEnabled: boolean;
        fillEnabled: boolean;
        strokeStyleLineWidth: number;
        strokeStyleLineDashOffset: number;
        strokeStyleMiterLimit: number;
        strokeStyleLineCapType:
            | 'strokeStyleButtCap'
            | 'strokeStyleRoundCap'
            | 'strokeStyleSquareCap';
        strokeStyleLineJoinType: string;
        strokeStyleLineAlignment: string;
        strokeStyleScaleLock: boolean;
        strokeStyleStrokeAdjust: boolean;
        strokeStyleLineDashSet: Array<any>;
        strokeStyleBlendMode: string;
        strokeStyleOpacity: number;
        strokeStyleContent:
            | {
                  color: RGBColor;
              } & StrokeGradient &
                  StrokePattern;
        strokeStyleResolution: number;
    };
    /** SOLIDFILL ONLY */
    layerSection: string;
    layerSVGdata: string;
    layerVectorPointData: string;
    pathBounds: {
        pathBounds: Record<'bottom' | 'top' | 'left' | 'right', number>;
    };
    preserveTransparency: boolean;
    proportionalScaling: boolean;
    keyOriginType?: Array<
        Record<
            'null',
            Partial<{
                keyActionMode: number;
                keyOriginBoxCorners: {};
                keyOriginResolution: number;
                /**
                 * borde-radius
                 */
                keyOriginRRectRadii: Record<
                    'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'unitValueQuadVersion',
                    number
                >;
                keyOriginShapeBBox: Record<
                    'bottom' | 'left' | 'right' | 'top' | 'keyOriginResolution',
                    number
                >;
                /**
                 * 2 => 矩形
                 *
                 * 5 => 椭圆
                 */
                keyOriginType: number;
                transform: Transform;
            }>
        >
    >;
    /** SMARTOBJECT ONLY */
    smartObject?: {
        linked: boolean;
        placed: string;
    };
    smartObjectMore?: {
        antiAliasType: number;
        size: {
            height: number;
            width: number;
        };
        transform: number[];
        type: number;
        frameCount: number;
        frameStep: {
            denominator: number;
            numerator: number;
        };
        wrap: {
            bounds: Record<'bottom' | 'left' | 'right' | 'top', number>;
            uOrder: number;
            vOrder: number;
            warpRotate: string;
            wrapStyle: string;
            warpValue: number;
            warpPerspective: number;
            warpPerspectiveOther: number;
        };
    };
    /** TEXT ONLY */
    textKey?: {
        antiAlias: string;
        boundingBox: Record<'bottom' | 'left' | 'right' | 'top', number>;
        bounds: Record<'bottom' | 'left' | 'right' | 'top', number>;
        kerningRange: unknown[];
        orientation: Orientation;
        paragraphStyleRange: Array<{
            from: number;
            to: number;
            paragraphStyle: {
                align?: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyAll';
                defaultTabWidth: number;
                directionType: string;
                endIndent: number;
                firstLineIndent: number;
                impliedEndIndent: number;
                impliedFirstLineIndent: number;
                impliedSpaceAfter: number;
                impliedSpaceBefore: number;
                impliedSpaceIndent: number;
                justifMethodDefault: string;
                keepTogether: boolean;
                spaceAfter: number;
                spaceBefore: number;
                startIndent: number;
                styleSheetHasParent: boolean;
                textComposerEngine: string;
            };
        }>;
        substitutesUsed: boolean;
        textClickPoint: {
            horizontal: number;
            vertical: number;
        };
        textGridding: string;
        textKey: string;
        textShape: Array<{
            base: {
                horizontal: number;
                vertical: number;
            };
            char: string;
            columnCount: number;
            columnGutter: number;
            firstBaselineMinimum: number;
            firstBaselineAlignment: string;
            orientation: Orientation;
            rowCount: number;
            rowGutter: number;
            rowMajorOrder: boolean;
            spacing: number;
            transform: Transform;
        }>;
        textStyleRange: Array<{
            from: number;
            to: number;
            textStyle: {
                autoKern?: string;
                baseline: 'normal' | 'superScript' | 'subScript';
                baselineDiretion: string;
                baselineShift: number;
                color: RGBColor;
                connectionForms: boolean;
                contextualLigatures: boolean;
                fontAvailable: boolean;
                fontCaps: 'normal' | 'allCaps' | 'smallCaps';
                fontName: string;
                fontPostScriptName: string;
                fontScript: number;
                fontStyleName: string;
                fontTechnology: number;
                horizontalScale: number;
                impliedBaselineShift: number;
                impliedFontSize: number;
                miterLimit: number;
                size: number;
                strokeColor: RGBColor;
                strikethrough: 'strikethroughOff' | 'xHeightStrikethroughOn';
                underline: 'underlineOff' | 'underlineOnLeftInVertical';
                styleSheetHasParent: boolean;
                verticalScale: number;
                baseParentStyle: {
                    alternateLigatures: boolean;
                    altligature: boolean;
                    autoKern: string;
                    autoLeading: boolean;
                    baseline: string;
                    baselineDirection: string;
                    baselineShift: number;
                    characterRotation: number;
                    color: RGBColor;
                    connectionForms: boolean;
                    contextualLigatures: boolean;
                    diacVPos: string;
                    diacXOffset: number;
                    diacYOffset: number;
                    digitSet: string;
                    dirOverride: string;
                    enableWariChu: boolean;
                    figureStyle: string;
                    fill: boolean;
                    fillFirst: boolean;
                    fillAvailable: boolean;
                    fontCaps: string;
                    fontName: string;
                    fontPistScriptName: string;
                    fontScript: number;
                    fontStyleName: string;
                    fontTechnology: number;
                    fractions: boolean;
                    gridAlignment: string;
                    horizontalScale: number;
                    impliedBaselineShift: number;
                    impliedFontSize: number;
                    italics: boolean;
                    japaneseAlternate: string;
                    jiDori: number;
                    justificationAlternates: boolean;
                    kana: boolean;
                    kashidas: string;
                    leftAki: number;
                    ligature: boolean;
                    lineCap: string;
                    lineDashoffset: number;
                    lineJoin: string;
                    lineWidth: number;
                    markYDistFromBaseline: number;
                    miterLimit: number;
                    mojiZume: number;
                    noBreak: boolean;
                    oldStyle: boolean;
                    ordinals: boolean;
                    ornaments: boolean;
                    otbaseline: string;
                    proportionalMetrics: boolean;
                    rigthAki: number;
                    ruby: boolean;
                    size: number;
                    strikethrough: string;
                    stroke: boolean;
                    strokeColor: RGBColor;
                    strokeOverPrint: boolean;
                    stylisticAlternated: boolean;
                    stylisticSets: number;
                    swash: boolean;
                    syntheticBold: boolean;
                    syntheticItalic: boolean;
                    tcyLeftRight: number;
                    tcyUpDown: number;
                    textLanguage: string;
                    titling: boolean;
                    tracking: number;
                    underline: string;
                    underlineOffset: number;
                    verticalScale: number;
                    wariChuCount: number;
                    wariChuJustification: string;
                    wariChuLineGap: number;
                    wariChuOrphan: number;
                    wariChuScale: number;
                    wariChuWidow: number;
                };
            };
        }>;
        transform: Transform;
        warp: Wrap;
    };
    textWarningLevel: number;
    useAlignedRendering: boolean;
    /** 0 ~ 255 */
    userMaskDensity: number;
    userMaskFeather: number;
    userMaskEnabled?: boolean;
    userMaskLinked?: boolean;
    /** 0 ~ 255 */
    vectorMaskDensity: number;
    vectorMaskFeather: number;
    vectorMaskEnabled?: boolean;
    vectorMaskLinked?: boolean;
    vectorMaskEmpty: boolean;
    visibleChannels: unknown[];
    visible: boolean;
};
