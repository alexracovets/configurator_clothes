// Texture resolution presets
export const TEXTURE_SIZE_EDITOR = 2048;
export const TEXTURE_SIZE_EXPORT = 4096;
export const TEXTURE_SIZE_MOBILE = 1024;
/** Lighter canvas while dragging text (4× fewer pixels than editor). */
export const TEXTURE_SIZE_DRAG = 1024;

// UV0 atlas bounds per mesh (measured from crewneck.gltf TEXCOORD_0)
// Design layers store position as normalised [0,1] within the part's own UV rect.
export const UV0_BOUNDS = {
  back:          { minX: 0.0038, maxX: 0.4985, minY: 0.0013, maxY: 0.7299 },
  front:         { minX: 0.5028, maxX: 0.9979, minY: 0.0872, maxY: 0.8119 },
  sleeve_left:   { minX: 0.0026, maxX: 0.2625, minY: 0.7191, maxY: 0.9967 },
  sleeve_right:  { minX: 0.3125, maxX: 0.5711, minY: 0.7182, maxY: 0.9980 },
} as const;

export type PrintZoneKey = keyof typeof UV0_BOUNDS;

// Per-part UV safe-zones (normalised 0-1 within UV0_BOUNDS)
export const PRINT_ZONES = {
  front:        { x: 0.15, y: 0.1,  w: 0.7, h: 0.65 },
  back:         { x: 0.15, y: 0.1,  w: 0.7, h: 0.65 },
  sleeve_left:  { x: 0.1,  y: 0.15, w: 0.8, h: 0.55 },
  sleeve_right: { x: 0.1,  y: 0.15, w: 0.8, h: 0.55 },
} as const;

// Konva layer z-ordering
export const Z_LAYER_PATTERN  = 0;
export const Z_LAYER_NUMBERS  = 1;
export const Z_LAYER_NAMES    = 2;
export const Z_LAYER_LOGOS    = 3;

/** Convert layer [0,1] coords to atlas UV0 canvas coords [0,1] */
export function layerToAtlasUV(
  lx: number, ly: number, zone: PrintZoneKey,
): { u: number; v: number } {
  const b = UV0_BOUNDS[zone];
  return {
    u: b.minX + lx * (b.maxX - b.minX),
    v: b.minY + ly * (b.maxY - b.minY),
  };
}

/** Convert atlas UV0 [0,1] to layer [0,1] coords within zone */
export function atlasUVToLayer(
  u: number, v: number, zone: PrintZoneKey,
): { lx: number; ly: number } {
  const b = UV0_BOUNDS[zone];
  return {
    lx: (u - b.minX) / (b.maxX - b.minX),
    ly: (v - b.minY) / (b.maxY - b.minY),
  };
}
