export const FONTS = [
  { label: "Serie EA",      value: "--font-oswald",        canvasFont: "Oswald" },
  { label: "Bebas Neue",    value: "--font-bebas-neue",    canvasFont: "Bebas Neue" },
  { label: "Anton",         value: "--font-anton",         canvasFont: "Anton" },
  { label: "Russo One",     value: "--font-russo-one",     canvasFont: "Russo One" },
  { label: "Black Ops One", value: "--font-black-ops-one", canvasFont: "Black Ops One" },
];

export const fontCssFamily = (cssVar: string) => `var(${cssVar})`;

export const fontCanvasName = (cssVar: string): string =>
  FONTS.find((f) => f.value === cssVar)?.canvasFont ?? cssVar;

export const DECAL_SCALE_MIN = 0.1;
export const DECAL_SCALE_MAX = 0.8;
export const DECAL_ASPECT = 1024 / 256;
export const DECAL_DEPTH = 0.3;

const REF_FONT_SIZE = 64;
const REF_DECAL_WIDTH = 1;
const FONT_SIZE_MIN = 24;
const FONT_SIZE_MAX = 120;

export const clampDecalScale = (width: number): [number, number, number] => {
  const w = Math.min(DECAL_SCALE_MAX, Math.max(DECAL_SCALE_MIN, width));
  return [w, w / DECAL_ASPECT, DECAL_DEPTH];
};

export const fontSizeToDecalScale = (fontSize: number): [number, number, number] =>
  clampDecalScale(REF_DECAL_WIDTH * (fontSize / REF_FONT_SIZE));

export const decalWidthToFontSize = (width: number): number =>
  Math.round(
    Math.min(
      FONT_SIZE_MAX,
      Math.max(FONT_SIZE_MIN, REF_FONT_SIZE * (width / REF_DECAL_WIDTH)),
    ),
  );
