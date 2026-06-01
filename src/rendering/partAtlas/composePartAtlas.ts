import type { PositionSlot } from '@utils';
import { UV0_BOUNDS } from '@utils';
import type { ConfiguratorPart, DesignLayer, LayerGlyph, PartGradient } from '@types';

import { drawBaseLayer } from './drawBaseLayer';
import { drawDesignOnPart } from './drawDesignOnPart';
import { drawPatternLayer } from './drawPatternLayer';

interface ComposePartAtlasInput {
  canvas: HTMLCanvasElement;
  baseColor: string;
  gradient: PartGradient;
  patternCanvas: HTMLCanvasElement | null;
  patternColor: string;
  patternOpacity: number;
  designLayers: DesignLayer[];
  glyphMap: Map<string, LayerGlyph>;
  part: ConfiguratorPart;
  scheduleRedraw: () => void;
  designOptions?: {
    showGizmo?: boolean;
    fast?: boolean;
    selectedId?: string | null;
    slots?: PositionSlot[];
  };
}

const composePartAtlas = ({
  canvas,
  baseColor,
  gradient,
  patternCanvas,
  patternColor,
  patternOpacity,
  designLayers,
  glyphMap,
  part,
  scheduleRedraw,
  designOptions,
}: ComposePartAtlasInput): void => {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);
  drawBaseLayer(ctx, size, baseColor, gradient);

  if (patternCanvas && patternOpacity > 0) {
    const uvBounds = UV0_BOUNDS[part as keyof typeof UV0_BOUNDS] ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    drawPatternLayer(ctx, size, patternCanvas, patternColor, patternOpacity, uvBounds);
    ctx.restore();
  }

  drawDesignOnPart(ctx, part, designLayers, glyphMap, scheduleRedraw, designOptions);
};

export type { ComposePartAtlasInput };
export { composePartAtlas };
