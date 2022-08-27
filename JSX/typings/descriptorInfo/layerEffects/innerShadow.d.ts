import { RGBColor } from '../color';
/** 内阴影 */
export declare type InnerShadow = {
    antiAlias: boolean;
    blur: number;
    chokeMatte: number;
    color: RGBColor;
    distance: number;
    enabled: boolean;
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
