import { RGBColor } from '../color';
/** 光泽 */
export declare type ChromeFX = {
    antiAlias: boolean;
    blur: number;
    color: RGBColor;
    distance: number;
    enabled: boolean;
    invert: boolean;
    localLightingAngle: number;
    mappingShape: {
        name: string;
    };
    mode: string;
    opacity: number;
    present: boolean;
    showInDialog: boolean;
};
