import type { DesignLayer, LayerGlyph } from '@types';

import { fontCanvasName } from '../fontDecal';
import { TEXTURE_SIZE_EDITOR } from './textureConstants';

const FONT_SCALE = 2.0;

const measureCtx: CanvasRenderingContext2D | null = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

type LayerStyleKeys = 'text' | 'font' | 'fontSize' | 'textColor' | 'strokeColor' | 'strokeWidth' | 'type' | 'visible';
type LayerStyle = Pick<DesignLayer, LayerStyleKeys>;

const serialiseLayerStyle = (layer: DesignLayer): string => {
  const style: LayerStyle = {
    text: layer.text,
    font: layer.font,
    fontSize: layer.fontSize,
    textColor: layer.textColor,
    strokeColor: layer.strokeColor,
    strokeWidth: layer.strokeWidth,
    type: layer.type,
    visible: layer.visible,
  };
  return JSON.stringify(style);
};

const serialiseLayersTransform = (layers: DesignLayer[]): string =>
  JSON.stringify(layers.map((l) => ({ id: l.id, x: l.x, y: l.y, rotation: l.rotation, zone: l.zone, visible: l.visible })));

const getDesignLayers = (layers: DesignLayer[]): DesignLayer[] => layers.filter((l) => l.visible && (l.type === 'text' || l.type === 'number'));

const renderLayerGlyph = (layer: DesignLayer, atlasSize: number): LayerGlyph => {
  const text = layer.text ?? (layer.type === 'number' ? '9' : 'NAME');
  const font = fontCanvasName(layer.font ?? '--font-oswald');
  const fontSize = Math.round((layer.fontSize ?? 128) * FONT_SCALE * (atlasSize / TEXTURE_SIZE_EDITOR));
  const strokeWidth = (layer.strokeWidth ?? 4) * FONT_SCALE * (atlasSize / TEXTURE_SIZE_EDITOR);
  measureCtx!.font = `bold ${fontSize}px "${font}"`;
  const metrics = measureCtx!.measureText(text);
  const textW = metrics.width;
  const textH = fontSize * 1.1;
  const pad = strokeWidth + 4;
  const w = Math.max(2, Math.ceil(textW + pad * 2));
  const h = Math.max(2, Math.ceil(textH + pad * 2));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `bold ${fontSize}px "${font}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor ?? '#1A2744';
    ctx.lineWidth = strokeWidth * 2;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, w / 2, h / 2);
  }
  ctx.fillStyle = layer.textColor ?? '#FFFFFF';
  ctx.fillText(text, w / 2, h / 2);
  return { canvas, halfW: w / 2, halfH: h / 2, styleSerial: serialiseLayerStyle(layer) };
};

const drawLayerFromGlyph = (ctx: CanvasRenderingContext2D, layer: DesignLayer, glyph: LayerGlyph, canvasSize: number): void => {
  const cx = layer.x * canvasSize;
  const cy = layer.y * canvasSize;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
  ctx.drawImage(glyph.canvas, -glyph.halfW, -glyph.halfH);
  ctx.restore();
};

export { drawLayerFromGlyph, getDesignLayers, renderLayerGlyph, serialiseLayersTransform, serialiseLayerStyle };
