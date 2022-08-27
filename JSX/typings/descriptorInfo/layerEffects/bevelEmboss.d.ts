import { RGBColor } from '../color';
/** 斜面和浮雕 */
export declare type BevelEmboss = {
    antialiasGloss: boolean;
    bevelDirction: 'in' | 'out';
    bevelStyle: string;
    bevelTechnique: string;
    blur: number;
    enabled: boolean;
    highlightColor: RGBColor;
    highlightMode: string;
    /** 0 ~ 100 % */
    lighlightOpacity: number;
    /** 0 ~ 100 % */
    localLightingAltitude: number;
    localLightingAngle: number;
    present: boolean;
    shadowColor: RGBColor;
    shadowMode: string;
    /** 0 ~ 100 % */
    shadowOpacity: number;
    showInDialog: boolean;
    softness: number;
    /** 0 ~ 1000 % */
    strengthRatio: number;
    transferSpec: {
        name: string;
    };
    useGlobalAngle: boolean;
    useShape: boolean;
    useTexture: boolean;
};
