import { RGBColor } from '../color';
/** 描边 */
export declare type FrameFX = {
    color: RGBColor;
    enabled: boolean;
    mode: string;
    opacity: number;
    overprint: boolean;
    paintType: string;
    present: boolean;
    showInDialog: boolean;
    size: number;
    style: 'insetFrame' | 'insetFrame' | 'centeredFrame';
    gradient: object;
    pattern: object;
};
