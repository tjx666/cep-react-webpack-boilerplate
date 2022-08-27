import { BevelEmboss } from './bevelEmboss';
import { ChromeFX } from './chromeFX';
import { DropShadow } from './dropShadow';
import { FrameFX } from './frameFX';
import { GradientFill } from './gradientFill';
import { InnerGlow } from './innerGlow';
import { InnerShadow } from './innerShadow';
import { OuterGlow } from './outerGlow';
import { SolidFill } from './solidFill';
export declare type LayerEffects = Partial<{
    scale: number;
    bevelEmboss: BevelEmboss;
    dropShadow: DropShadow;
    innerGlow: InnerGlow;
    outerGlow: OuterGlow;
    innerShadow: InnerShadow;
    chromeFX: ChromeFX;
    frameFX: FrameFX;
    solidFill: SolidFill;
    gradientFill: GradientFill;
    solidFillMulti: {
        solidFill: SolidFill;
    }[];
    gradientFillMulti: {
        gradientFill: GradientFill;
    }[];
    dropShadowMulti: {
        dropShadow: DropShadow;
    }[];
    innerShadowMulti: {
        innerShadow: InnerShadow;
    }[];
    frameFXMulti: {
        frameFX: FrameFX;
    }[];
}>;
