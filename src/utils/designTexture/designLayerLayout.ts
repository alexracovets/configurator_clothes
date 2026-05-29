import type { DesignLayer, GizmoHandle, GizmoZone, LayerLayout } from '@types';

import { fontCanvasName } from '../fontDecal';
import { TEXTURE_SIZE_EDITOR } from './textureConstants';

const HANDLE_RADIUS = 22;
const BOX_PAD_X = HANDLE_RADIUS + 10;
const BOX_PAD_Y = HANDLE_RADIUS + 10;
const FONT_SCALE = 2.0;
const GIZMO_HANDLES: GizmoHandle[] = ['copy', 'delete', 'rotate', 'resize'];

const buildLayerLayout = (ctx: CanvasRenderingContext2D, layer: DesignLayer, size: number): LayerLayout => {
  const font = fontCanvasName(layer.font ?? '--font-oswald');
  const fontSize = Math.round((layer.fontSize ?? 128) * FONT_SCALE * (size / TEXTURE_SIZE_EDITOR));
  ctx.font = `bold ${fontSize}px "${font}"`;
  const metrics = ctx.measureText(layer.text ?? '');
  const textW = metrics.width;
  const textH = fontSize * 1.1;
  const cx = layer.x * size;
  const cy = layer.y * size;
  const rad = ((layer.rotation ?? 0) * Math.PI) / 180;
  const hw = textW / 2 + BOX_PAD_X;
  const hh = textH / 2 + BOX_PAD_Y;
  const corners = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ] as [number, number][];
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const [lx, ly] of corners) {
    const rx = cx + lx * cos - ly * sin;
    const ry = cy + lx * sin + ly * cos;
    if (rx < minX) minX = rx;
    if (rx > maxX) maxX = rx;
    if (ry < minY) minY = ry;
    if (ry > maxY) maxY = ry;
  }
  const minBoxSize = HANDLE_RADIUS * 4 + 8;
  const boxW = Math.max(maxX - minX, minBoxSize);
  const boxH = Math.max(maxY - minY, minBoxSize);
  const textBox = { x: cx - boxW / 2, y: cy - boxH / 2, w: boxW, h: boxH };
  const hr = HANDLE_RADIUS;
  return {
    textBox,
    handles: {
      copy: { x: textBox.x + hr, y: textBox.y + hr },
      rotate: { x: textBox.x + textBox.w - hr, y: textBox.y + hr },
      delete: { x: textBox.x + hr, y: textBox.y + textBox.h - hr },
      resize: { x: textBox.x + textBox.w - hr, y: textBox.y + textBox.h - hr },
    },
  };
};

const hitTestLayout = (uvX: number, uvY: number, layout: LayerLayout, size: number): GizmoZone => {
  const px = uvX * size;
  const py = uvY * size;
  for (const h of GIZMO_HANDLES) {
    const { x: hx, y: hy } = layout.handles[h];
    if (Math.hypot(px - hx, py - hy) <= HANDLE_RADIUS) return h;
  }
  const b = layout.textBox;
  if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return 'body';
  return null;
};

const drawGizmoFrame = (ctx: CanvasRenderingContext2D, box: LayerLayout['textBox']) => {
  ctx.save();
  ctx.setLineDash([14, 8]);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 4;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.restore();
};

const drawGizmoHandle = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }, kind: GizmoHandle) => {
  const r = HANDLE_RADIUS;
  const s = 8;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = kind === 'delete' ? '#ef4444' : '#374151';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (kind) {
    case 'copy':
      ctx.strokeRect(pos.x - s * 0.3, pos.y - s * 0.3, s * 0.85, s * 0.85);
      ctx.strokeRect(pos.x - s * 0.85, pos.y - s * 0.85, s * 0.85, s * 0.85);
      break;
    case 'delete':
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y - s * 0.5);
      ctx.lineTo(pos.x + s, pos.y - s * 0.5);
      ctx.stroke();
      ctx.strokeRect(pos.x - s * 0.65, pos.y - s * 0.15, s * 1.3, s * 0.95);
      break;
    case 'rotate':
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 0.55, 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.45, pos.y - s * 0.55);
      ctx.lineTo(pos.x + s * 0.75, pos.y - s * 0.2);
      ctx.lineTo(pos.x + s * 0.35, pos.y - s * 0.35);
      ctx.stroke();
      break;
    case 'resize':
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y + s);
      ctx.lineTo(pos.x + s, pos.y - s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.2, pos.y - s);
      ctx.lineTo(pos.x + s, pos.y - s);
      ctx.lineTo(pos.x + s, pos.y - s * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y - s * 0.2);
      ctx.lineTo(pos.x - s, pos.y + s);
      ctx.lineTo(pos.x - s * 0.2, pos.y + s);
      ctx.stroke();
      break;
  }
  ctx.restore();
};

export { buildLayerLayout, drawGizmoFrame, drawGizmoHandle, GIZMO_HANDLES, hitTestLayout };
