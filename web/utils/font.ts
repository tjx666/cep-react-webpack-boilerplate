import csInterface from './CSInterface';

export type LocalFont = {
    name: string;
    family: string;
    style: string;
    postScriptName: string;
};

export function getLocalFonts() {
    return csInterface.invoke<LocalFont[]>('font.getLocalFonts');
}
