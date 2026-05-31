import type { DesignLayer } from '@types';

import { fontCanvasName } from '../fontDecal';
import { imageCache } from './designLayerGlyph';
import { TEXTURE_SIZE_EDITOR } from './textureConstants';

const HANDLE_RADIUS_UV = 22 / 2048; // handle radius as UV fraction of editor size
const FONT_SCALE = 2.0;

export type GizmoHandle = 'copy' | 'delete' | 'rotate' | 'resize';
export type GizmoZone = GizmoHandle | 'body' | null;

export interface LayerLayout {
  textBox: { x: number; y: number; w: number; h: number };
  handles: Record<GizmoHandle, { x: number; y: number }>;
}

const GIZMO_HANDLES: GizmoHandle[] = ['copy', 'delete', 'rotate', 'resize'];

const buildLayerLayout = (ctx: CanvasRenderingContext2D, layer: DesignLayer, size: number): LayerLayout => {
  // Scale all pixel constants with canvas size so gizmo looks identical at any resolution
  const hr = Math.round(HANDLE_RADIUS_UV * size);
  const pad = hr + Math.round((10 * size) / 2048);
  let hw: number;
  let hh: number;

  if (layer.type === 'logo') {
    const img = imageCache.get(layer.src ?? '');
    const aspect = img?.naturalWidth && img?.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
    const wHalf = Math.max(0.04, layer.scaleX ?? 0.07) * size * 0.5;
    hw = wHalf + pad;
    hh = wHalf / aspect + pad;
  } else {
    const font = fontCanvasName(layer.font ?? '--font-oswald');
    const fontSize = Math.round((layer.fontSize ?? 128) * FONT_SCALE * (size / TEXTURE_SIZE_EDITOR));
    ctx.font = `bold ${fontSize}px "${font}"`;
    const metrics = ctx.measureText(layer.text ?? '');
    hw = metrics.width / 2 + pad;
    hh = (fontSize * 1.1) / 2 + pad;
  }

  const cx = layer.x * size;
  const cy = layer.y * size;
  const uvCompensationDeg = layer.type === 'logo' ? (layer.x >= 0.5 ? -90 : 90) : 0;
  const totalRotDeg = (layer.rotation ?? 0) + uvCompensationDeg;
  const rad = (totalRotDeg * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);

  const minBoxSize = hr * 4 + Math.round((8 * size) / 2048);
  const boxW = Math.max(hw * 2, minBoxSize);
  const boxH = Math.max(hh * 2, minBoxSize);
  // textBox in unrotated canvas coords (used for rotated strokeRect)
  const textBox = { x: cx - boxW / 2, y: cy - boxH / 2, w: boxW, h: boxH };

  // Rotate a point around (cx, cy)
  const rot = (lx: number, ly: number) => ({
    x: cx + (lx - cx) * cosR - (ly - cy) * sinR,
    y: cy + (lx - cx) * sinR + (ly - cy) * cosR,
  });

  // For back zone (x < 0.5) UV compensation is +90° (vs -90° for front),
  // which flips the visual top/bottom — swap handle Y rows to keep delete top-left on model
  const isBack = layer.type === 'logo' && layer.x < 0.5;
  const topY = isBack ? textBox.y + hr : textBox.y + textBox.h - hr;
  const bottomY = isBack ? textBox.y + textBox.h - hr : textBox.y + hr;

  return {
    textBox,
    handles: {
      delete: rot(textBox.x + hr, topY),
      resize: rot(textBox.x + textBox.w - hr, topY),
      copy: rot(textBox.x + hr, bottomY),
      rotate: rot(textBox.x + textBox.w - hr, bottomY),
    },
  };
};

const hitTestLayout = (uvX: number, uvY: number, layout: LayerLayout, size: number): GizmoZone => {
  const px = uvX * size;
  const py = uvY * size;
  const hr = Math.round(HANDLE_RADIUS_UV * size);
  for (const h of GIZMO_HANDLES) {
    const { x: hx, y: hy } = layout.handles[h];
    if (Math.hypot(px - hx, py - hy) <= hr) return h;
  }
  const b = layout.textBox;
  if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return 'body';
  return null;
};

const drawGizmoFrame = (ctx: CanvasRenderingContext2D, box: LayerLayout['textBox'], size = 2048, rotationDeg = 0) => {
  const scale = size / 2048;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.setLineDash([Math.round(14 * scale), Math.round(8 * scale)]);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = Math.max(1, Math.round(4 * scale));
  ctx.strokeRect(-box.w / 2, -box.h / 2, box.w, box.h);
  ctx.restore();
};

const drawGizmoHandle = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }, kind: GizmoHandle, size = 2048) => {
  const r = Math.round(HANDLE_RADIUS_UV * size);
  const s = Math.round((8 * size) / 2048);
  ctx.save();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = Math.max(1, (1.5 * size) / 2048);
  ctx.stroke();
  // Icon drawn in canvas coords relative to flipped center, no extra Y flip needed
  // (icon shapes use +y = down in canvas = up on model, which is correct visually)
  ctx.translate(pos.x, pos.y);
  ctx.rotate(Math.PI / 2);
  ctx.strokeStyle = kind === 'delete' ? '#ef4444' : '#374151';
  ctx.lineWidth = Math.max(1, (2 * size) / 2048);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (kind) {
    case 'copy':
      ctx.strokeRect(-s * 0.3, -s * 0.3, s * 0.85, s * 0.85);
      ctx.strokeRect(-s * 0.85, -s * 0.85, s * 0.85, s * 0.85);
      break;
    case 'delete':
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.5);
      ctx.lineTo(s, -s * 0.5);
      ctx.stroke();
      ctx.strokeRect(-s * 0.65, -s * 0.15, s * 1.3, s * 0.95);
      break;
    case 'rotate':
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.55, 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.45, -s * 0.55);
      ctx.lineTo(s * 0.75, -s * 0.2);
      ctx.lineTo(s * 0.35, -s * 0.35);
      ctx.stroke();
      break;
    case 'resize':
      ctx.beginPath();
      ctx.moveTo(-s, s);
      ctx.lineTo(s, -s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s);
      ctx.lineTo(s, -s);
      ctx.lineTo(s, -s * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.2);
      ctx.lineTo(-s, s);
      ctx.lineTo(-s * 0.2, s);
      ctx.stroke();
      break;
  }
  ctx.restore();
};

export { buildLayerLayout, drawGizmoFrame, drawGizmoHandle, GIZMO_HANDLES, hitTestLayout };
