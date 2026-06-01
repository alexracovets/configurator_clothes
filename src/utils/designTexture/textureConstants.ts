const TEXTURE_SIZE_EDITOR = 2048;
const TEXTURE_SIZE_DRAG = 1024;

const UV0_BOUNDS = {
  back: { minX: 0.0038, maxX: 0.4985, minY: 0.0013, maxY: 0.7299 },
  front: { minX: 0.5028, maxX: 0.9979, minY: 0.0872, maxY: 0.8119 },
  sleeve_left: { minX: 0.0026, maxX: 0.2625, minY: 0.7191, maxY: 0.9967 },
  sleeve_right: { minX: 0.3125, maxX: 0.5711, minY: 0.7182, maxY: 0.998 },
  left: { minX: 0.0, maxX: 1.0, minY: 0.0, maxY: 1.0 },
  right: { minX: 0.0, maxX: 1.0, minY: 0.0, maxY: 1.0 },
  // full UV0 atlas — used for logos that span the whole model texture
  full: { minX: 0.0, maxX: 1.0, minY: 0.0, maxY: 1.0 },
} as const;

const PRINT_ZONES = {
  front: { x: 0.15, y: 0.1, w: 0.7, h: 0.65 },
  back: { x: 0.15, y: 0.1, w: 0.7, h: 0.65 },
  sleeve_left: { x: 0.1, y: 0.15, w: 0.8, h: 0.55 },
  sleeve_right: { x: 0.1, y: 0.15, w: 0.8, h: 0.55 },
  left: { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
  right: { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
  full: { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
} as const;

export { PRINT_ZONES, TEXTURE_SIZE_DRAG, TEXTURE_SIZE_EDITOR, UV0_BOUNDS };
