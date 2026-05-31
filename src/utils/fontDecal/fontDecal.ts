import { FONTS } from '@constants';

const fontCssFamily = (cssVar: string) => `var(${cssVar})`;

const fontCanvasName = (cssVar: string): string => FONTS.find((f) => f.value === cssVar)?.canvasFont ?? cssVar;

export { fontCanvasName, fontCssFamily };
