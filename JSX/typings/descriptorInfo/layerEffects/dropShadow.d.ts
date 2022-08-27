import { RGBColor } from '../color';
/** 投影 */
export declare type DropShadow = {
    antiAlias: boolean;
    blur: number;
    chokeMatte: number;
    color: RGBColor;
    enabled: boolean;
    distance: number;
    layerCanceals: boolean;
    localLightingAngle: number;
    mode: string;
    noise: number;
    opacity: number;
    present: boolean;
    showInDialog: boolean;
    transferSpec: {
        name: string;
    };
    useGlobalAngle: boolean;
};
