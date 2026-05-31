import type { DesignLayer, LayerGlyph } from '@types';

import { drawLayerFromGlyph, getOrLoadImage } from './designLayerGlyph';
import { buildLayerLayout, drawGizmoFrame, drawGizmoHandle, GIZMO_HANDLES } from './designLayerLayout';

export interface PositionSlot {
  x: number;
  y: number;
  rotation: number;
  widthFraction: number;
  heightFraction: number;
}

interface PositionConfig {
  uv: { x: number; y: number };
  rotation: number;
  slotWidth: number;
  slotHeight: number;
  slotOffsetX?: number;
  slotOffsetY?: number;
}

export interface CompositeZoneOptions {
  showGizmo?: boolean;
  fast?: boolean;
}

export const buildPositionSlots = (positions: PositionConfig[]): PositionSlot[] =>
  positions.map((p) => ({
    x: p.uv.x + (p.slotOffsetX ?? 0),
    y: p.uv.y + (p.slotOffsetY ?? 0),
    rotation: p.rotation,
    widthFraction: p.slotWidth,
    heightFraction: p.slotHeight,
  }));

const drawPositionSlot = (ctx: CanvasRenderingContext2D, slot: PositionSlot, size: number): void => {
  const cx = slot.x * size;
  const cy = slot.y * size;
  const w = slot.widthFraction * size;
  const h = slot.heightFraction * size;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((slot.rotation * Math.PI) / 180);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = Math.max(4, size / 256);
  ctx.setLineDash([size / 80, size / 80]);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.restore();
};

// Draw logo directly from cached image — bypasses glyph system so scaleX/Y is always current
// UV mesh orientation compensation:
// front zone UV x: 0.50-1.00 → mesh is rotated -90° relative to canvas
// back zone  UV x: 0.00-0.50 → mesh is rotated +90° relative to canvas
const uvCompensationRad = (x: number): number => {
  if (x >= 0.5) return -Math.PI / 2; // front
  return Math.PI / 2; // back
};

const drawLogoLayer = (ctx: CanvasRenderingContext2D, layer: DesignLayer, size: number, scheduleRedraw: () => void): void => {
  const src = layer.src ?? '';
  if (!src) return;
  const img = getOrLoadImage(src, scheduleRedraw);
  if (!img || !img.complete || !img.naturalWidth) return;
  const aspect = img.naturalWidth / img.naturalHeight;
  const w = (layer.scaleX ?? 0.07) * size;
  const h = w / aspect;
  const cx = layer.x * size;
  const cy = layer.y * size;
  const userRot = ((layer.rotation ?? 0) * Math.PI) / 180;
  const compensation = uvCompensationRad(layer.x);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(compensation + userRot);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
};

// scheduleRedraw injected by engine so image-load callbacks can trigger redraws
let _scheduleRedraw: () => void = () => {};
export const setCompositeScheduleRedraw = (fn: () => void): void => {
  _scheduleRedraw = fn;
};

const compositeZone = (
  canvas: HTMLCanvasElement,
  layers: DesignLayer[],
  glyphMap: Map<string, LayerGlyph>,
  selectedId: string | null,
  options: CompositeZoneOptions = {},
  slots: PositionSlot[] = [],
): void => {
  const { showGizmo = true, fast = false } = options;
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = !fast;
  if (!fast) ctx.imageSmoothingQuality = 'high';
  for (const slot of slots) drawPositionSlot(ctx, slot, size);
  for (const layer of layers) {
    if (layer.type === 'logo') {
      drawLogoLayer(ctx, layer, size, _scheduleRedraw);
    } else {
      const glyph = glyphMap.get(layer.id);
      if (!glyph) continue;
      drawLayerFromGlyph(ctx, layer, glyph, size);
    }
  }
  if (showGizmo && selectedId) {
    const selected = layers.find((l) => l.id === selectedId);
    if (selected) {
      const layout = buildLayerLayout(ctx, selected, size);
      const uvComp = selected.type === 'logo' ? (selected.x >= 0.5 ? -90 : 90) : 0;
      drawGizmoFrame(ctx, layout.textBox, size, (selected.rotation ?? 0) + uvComp);
      for (const kind of GIZMO_HANDLES) drawGizmoHandle(ctx, layout.handles[kind], kind, size);
    }
  }
};

export { compositeZone };
