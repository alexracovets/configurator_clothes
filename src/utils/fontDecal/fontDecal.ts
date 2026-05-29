import { DECAL_SCALE_MIN, DECAL_SCALE_MAX, DECAL_ASPECT, DECAL_DEPTH, FONT_SIZE_MIN, FONT_SIZE_MAX, FONTS } from "@constants";

const fontCssFamily = (cssVar: string) => `var(${cssVar})`;

const fontCanvasName = (cssVar: string): string => FONTS.find((f) => f.value === cssVar)?.canvasFont ?? cssVar;

const REF_FONT_SIZE = 64;
const REF_DECAL_WIDTH = 1;

const clampDecalScale = (width: number): [number, number, number] => {
  const w = Math.min(DECAL_SCALE_MAX, Math.max(DECAL_SCALE_MIN, width));
  return [w, w / DECAL_ASPECT, DECAL_DEPTH];
};

const fontSizeToDecalScale = (fontSize: number): [number, number, number] =>
  clampDecalScale(REF_DECAL_WIDTH * (fontSize / REF_FONT_SIZE));

const decalWidthToFontSize = (width: number): number =>
  Math.round(Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, REF_FONT_SIZE * (width / REF_DECAL_WIDTH))));

export { fontCssFamily, fontCanvasName, clampDecalScale, fontSizeToDecalScale, decalWidthToFontSize };
