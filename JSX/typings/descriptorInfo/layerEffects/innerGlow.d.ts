import { RGBColor } from '../color';
/** 内发光 */
export declare type InnerGlow = {
    antiAlias: boolean;
    blur: number;
    chokeMatte: number;
    color: RGBColor;
    enabled: boolean;
    glowTechnique: string;
    innerGlowSource: string;
    inputRange: number;
    mode: string;
    noise: number;
    opacity: number;
    present: boolean;
    shadingNoise: number;
    showInDialog: boolean;
    transferSpec: {
        name: string;
    };
};
