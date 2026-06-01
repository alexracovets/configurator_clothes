type UvBounds = { minX: number; maxX: number; minY: number; maxY: number };

/**
 * Maps pattern in global atlas UV space onto a part-local canvas (0–1),
 * matching the old PatternLayer behaviour where mesh UV0 sampled the pattern
 * texture at absolute atlas coordinates.
 */
const drawPatternLayer = (
  ctx: CanvasRenderingContext2D,
  size: number,
  patternCanvas: HTMLCanvasElement,
  patternColor: string,
  patternOpacity: number,
  uvBounds: UvBounds,
): void => {
  const pw = patternCanvas.width;
  const ph = patternCanvas.height;
  const sx = uvBounds.minX * pw;
  const sy = uvBounds.minY * ph;
  const sw = (uvBounds.maxX - uvBounds.minX) * pw;
  const sh = (uvBounds.maxY - uvBounds.minY) * ph;

  const tinted = document.createElement('canvas');
  tinted.width = size;
  tinted.height = size;
  const tctx = tinted.getContext('2d');
  if (!tctx) return;

  tctx.drawImage(patternCanvas, sx, sy, sw, sh, 0, 0, size, size);
  tctx.globalCompositeOperation = 'source-in';
  tctx.fillStyle = patternColor;
  tctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.globalAlpha = patternOpacity;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(tinted, 0, 0);
  ctx.restore();
};

export type { UvBounds };
export { drawPatternLayer };
