import type { PositionSlot } from '@utils';
import { buildLayerLayout, drawGizmoFrame, drawGizmoHandle, drawLayerFromGlyph, getOrLoadImage, GIZMO_HANDLES, UV0_BOUNDS } from '@utils';
import type { DesignLayer, LayerGlyph } from '@types';

const LOGO_PARTS = new Set(['front', 'back', 'left', 'right']);

type UvBounds = { minX: number; maxX: number; minY: number; maxY: number };

const atlasToPartLocal = (atlasX: number, atlasY: number, bounds: UvBounds): { x: number; y: number } | null => {
  const x = (atlasX - bounds.minX) / (bounds.maxX - bounds.minX);
  const y = (atlasY - bounds.minY) / (bounds.maxY - bounds.minY);
  if (x < -0.25 || x > 1.25 || y < -0.25 || y > 1.25) return null;
  return { x, y };
};

const uvCompensationRad = (atlasX: number): number => {
  if (atlasX >= 0.5) return -Math.PI / 2;
  return Math.PI / 2;
};

const drawLogoOnPart = (ctx: CanvasRenderingContext2D, layer: DesignLayer, size: number, part: string, scheduleRedraw: () => void): void => {
  const bounds = UV0_BOUNDS[part as keyof typeof UV0_BOUNDS] as UvBounds | undefined;
  if (!bounds) return;

  const local = atlasToPartLocal(layer.x, layer.y, bounds);
  if (!local) return;

  const src = layer.src ?? '';
  if (!src) return;
  const img = getOrLoadImage(src, scheduleRedraw);
  if (!img || !img.complete || !img.naturalWidth) return;

  const aspect = img.naturalWidth / img.naturalHeight;
  const w = (layer.scaleX ?? 0.07) * size;
  const h = w / aspect;
  const cx = local.x * size;
  const cy = local.y * size;
  const userRot = ((layer.rotation ?? 0) * Math.PI) / 180;
  const compensation = uvCompensationRad(layer.x);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(compensation + userRot);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
};

const collectLayersForPart = (part: string, layers: DesignLayer[]): DesignLayer[] => {
  const zoneLayers = layers.filter((l) => l.visible !== false && l.zone === part);
  if (!LOGO_PARTS.has(part)) return zoneLayers;
  const logos = layers.filter((l) => l.visible !== false && l.zone === 'full' && l.type === 'logo');
  return [...zoneLayers, ...logos];
};

interface DrawDesignOptions {
  showGizmo?: boolean;
  fast?: boolean;
  selectedId?: string | null;
  slots?: PositionSlot[];
}

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

const drawDesignOnPart = (
  ctx: CanvasRenderingContext2D,
  part: string,
  allLayers: DesignLayer[],
  glyphMap: Map<string, LayerGlyph>,
  scheduleRedraw: () => void,
  options: DrawDesignOptions = {},
): void => {
  const { showGizmo = false, fast = false, selectedId = null, slots = [] } = options;
  const size = ctx.canvas.width;
  const layers = collectLayersForPart(part, allLayers);

  ctx.save();
  ctx.imageSmoothingEnabled = !fast;
  if (!fast) ctx.imageSmoothingQuality = 'high';

  for (const slot of slots) drawPositionSlot(ctx, slot, size);

  for (const layer of layers) {
    if (layer.type === 'logo' && layer.zone === 'full') {
      drawLogoOnPart(ctx, layer, size, part, scheduleRedraw);
    } else {
      const glyph = glyphMap.get(layer.id);
      if (!glyph) continue;
      drawLayerFromGlyph(ctx, layer, glyph, size);
    }
  }

  if (showGizmo && selectedId) {
    const selected = layers.find((l) => l.id === selectedId);
    if (selected) {
      let layoutLayer: DesignLayer = selected;
      if (selected.type === 'logo' && selected.zone === 'full') {
        const bounds = UV0_BOUNDS[part as keyof typeof UV0_BOUNDS] as UvBounds | undefined;
        const local = bounds ? atlasToPartLocal(selected.x, selected.y, bounds) : null;
        if (local) layoutLayer = { ...selected, x: local.x, y: local.y };
      }
      const layout = buildLayerLayout(ctx, layoutLayer, size);
      const uvComp = selected.type === 'logo' ? (selected.x >= 0.5 ? -90 : 90) : 0;
      drawGizmoFrame(ctx, layout.textBox, size, (selected.rotation ?? 0) + uvComp);
      for (const kind of GIZMO_HANDLES) drawGizmoHandle(ctx, layout.handles[kind], kind, size);
    }
  }

  ctx.restore();
};

export { collectLayersForPart, drawDesignOnPart };
