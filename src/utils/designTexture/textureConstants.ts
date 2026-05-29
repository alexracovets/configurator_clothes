const TEXTURE_SIZE_EDITOR = 2048;
const TEXTURE_SIZE_EXPORT = 4096;
const TEXTURE_SIZE_MOBILE = 1024;
const TEXTURE_SIZE_DRAG = 1024;

const UV0_BOUNDS = {
  back: { minX: 0.0038, maxX: 0.4985, minY: 0.0013, maxY: 0.7299 },
  front: { minX: 0.5028, maxX: 0.9979, minY: 0.0872, maxY: 0.8119 },
  sleeve_left: { minX: 0.0026, maxX: 0.2625, minY: 0.7191, maxY: 0.9967 },
  sleeve_right: { minX: 0.3125, maxX: 0.5711, minY: 0.7182, maxY: 0.998 },
} as const;

export type PrintZoneKey = keyof typeof UV0_BOUNDS;

const PRINT_ZONES = {
  front: { x: 0.15, y: 0.1, w: 0.7, h: 0.65 },
  back: { x: 0.15, y: 0.1, w: 0.7, h: 0.65 },
  sleeve_left: { x: 0.1, y: 0.15, w: 0.8, h: 0.55 },
  sleeve_right: { x: 0.1, y: 0.15, w: 0.8, h: 0.55 },
} as const;

const Z_LAYER_PATTERN = 0;
const Z_LAYER_NUMBERS = 1;
const Z_LAYER_NAMES = 2;
const Z_LAYER_LOGOS = 3;

const layerToAtlasUV = (lx: number, ly: number, zone: PrintZoneKey): { u: number; v: number } => {
  const b = UV0_BOUNDS[zone];
  return { u: b.minX + lx * (b.maxX - b.minX), v: b.minY + ly * (b.maxY - b.minY) };
};

const atlasUVToLayer = (u: number, v: number, zone: PrintZoneKey): { lx: number; ly: number } => {
  const b = UV0_BOUNDS[zone];
  return { lx: (u - b.minX) / (b.maxX - b.minX), ly: (v - b.minY) / (b.maxY - b.minY) };
};

export {
  atlasUVToLayer,
  layerToAtlasUV,
  PRINT_ZONES,
  TEXTURE_SIZE_DRAG,
  TEXTURE_SIZE_EDITOR,
  TEXTURE_SIZE_EXPORT,
  TEXTURE_SIZE_MOBILE,
  UV0_BOUNDS,
  Z_LAYER_LOGOS,
  Z_LAYER_NAMES,
  Z_LAYER_NUMBERS,
  Z_LAYER_PATTERN,
};
