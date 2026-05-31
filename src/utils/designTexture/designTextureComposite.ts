import type { DesignLayer, LayerGlyph } from '@types';

import { drawLayerFromGlyph } from './designLayerGlyph';

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

const compositeZone = (canvas: HTMLCanvasElement, layers: DesignLayer[], glyphMap: Map<string, LayerGlyph>, slots: PositionSlot[] = []): void => {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  for (const slot of slots) drawPositionSlot(ctx, slot, size);
  for (const layer of layers) {
    const glyph = glyphMap.get(layer.id);
    if (!glyph) continue;
    drawLayerFromGlyph(ctx, layer, glyph, size);
  }
};

export { compositeZone };
