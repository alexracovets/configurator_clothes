import type { PartGradient } from '@types';

const drawBaseLayer = (ctx: CanvasRenderingContext2D, size: number, baseColor: string, gradient: PartGradient): void => {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  if (!gradient.enabled) return;

  const angleRad = (gradient.rotation * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2;
  const halfLen = size * 0.707;
  const x0 = cx - Math.cos(angleRad) * halfLen;
  const y0 = cy - Math.sin(angleRad) * halfLen;
  const x1 = cx + Math.cos(angleRad) * halfLen;
  const y1 = cy + Math.sin(angleRad) * halfLen;

  const mid = gradient.position / 100;
  const spread = (gradient.softness / 100) * 0.5;
  const stop0 = Math.max(0, mid - spread);
  const stop1 = Math.min(1, Math.max(mid + spread, stop0 + 0.001));
  const opacity = gradient.opacity / 100;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(stop0, 'rgba(0,0,0,0)');
  grad.addColorStop(stop1, gradient.color2);
  grad.addColorStop(1, gradient.color2);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
};

export { drawBaseLayer };
