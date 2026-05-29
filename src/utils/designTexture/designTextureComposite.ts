import type { DesignLayer, LayerGlyph } from '@types';

import { drawLayerFromGlyph } from './designLayerGlyph';
import { buildLayerLayout, drawGizmoFrame, drawGizmoHandle, GIZMO_HANDLES } from './designLayerLayout';

interface CompositeZoneOptions {
  showGizmo?: boolean;
  fast?: boolean;
}

const compositeZone = (
  canvas: HTMLCanvasElement,
  layers: DesignLayer[],
  glyphMap: Map<string, LayerGlyph>,
  selectedId: string | null,
  options: CompositeZoneOptions = {},
): void => {
  const { showGizmo = true, fast = false } = options;
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = !fast;
  if (!fast) ctx.imageSmoothingQuality = 'high';
  for (const layer of layers) {
    const glyph = glyphMap.get(layer.id);
    if (!glyph) continue;
    drawLayerFromGlyph(ctx, layer, glyph, size);
  }
  if (showGizmo && selectedId) {
    const selected = layers.find((l) => l.id === selectedId);
    if (selected) {
      const layout = buildLayerLayout(ctx, selected, size);
      drawGizmoFrame(ctx, layout.textBox);
      for (const kind of GIZMO_HANDLES) drawGizmoHandle(ctx, layout.handles[kind], kind);
    }
  }
};

export type { CompositeZoneOptions };
export { compositeZone };
