import { RGBColor } from '../color';
/** 渐变叠加 */
export declare type GradientFill = {
    align: boolean;
    angle: number;
    dither: boolean;
    enabled: boolean;
    gradient: {
        colors: Array<{
            colorStop: {
                color: RGBColor;
                location: number;
                midpoint: number;
                type: string;
            };
        }>;
    };
};
