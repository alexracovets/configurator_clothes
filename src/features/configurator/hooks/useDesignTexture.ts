"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";

import { TEXTURE_SIZE_EDITOR } from "../texture/textureConstants";
import type { PrintZoneKey } from "../texture/textureConstants";
import { useConfiguratorStore } from "../store";
import type { DesignLayer } from "../store/configurator.store";

// CSS variable → font name mapping
const CSS_VAR_TO_FONT: Record<string, string> = {
  "--font-oswald": "Oswald",
  "--font-bebas-neue": "Bebas Neue",
  "--font-anton": "Anton",
  "--font-russo-one": "Russo One",
  "--font-black-ops-one": "Black Ops One",
};

function resolveFont(cssVar: string): string {
  return CSS_VAR_TO_FONT[cssVar] ?? cssVar;
}

// Gizmo constants
const HANDLE_RADIUS = 22;
const BOX_PAD_X = HANDLE_RADIUS + 10;
const BOX_PAD_Y = HANDLE_RADIUS + 10;
const FONT_SCALE = 2.0;

export type GizmoHandle = "copy" | "delete" | "rotate" | "resize";
export type GizmoZone = GizmoHandle | "body" | null;
const GIZMO_HANDLES: GizmoHandle[] = ["copy", "delete", "rotate", "resize"];

export interface LayerLayout {
  textBox: { x: number; y: number; w: number; h: number };
  handles: Record<GizmoHandle, { x: number; y: number }>;
}

export function buildLayerLayout(
  ctx: CanvasRenderingContext2D,
  layer: DesignLayer,
  size: number,
): LayerLayout {
  const font = resolveFont(layer.font ?? "--font-oswald");
  const fontSize = Math.round(
    (layer.fontSize ?? 128) * FONT_SCALE * (size / TEXTURE_SIZE_EDITOR),
  );
  ctx.font = `bold ${fontSize}px "${font}"`;

  const metrics = ctx.measureText(layer.text ?? "");
  const textW = metrics.width;
  const textH = fontSize * 1.1;
  const cx = layer.x * size;
  const cy = layer.y * size;
  const rad = ((layer.rotation ?? 0) * Math.PI) / 180;

  // Compute AABB of rotated text corners
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

  // Ensure box is large enough for 4 non-overlapping handles
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
}

export function hitTestLayout(
  uvX: number,
  uvY: number,
  layout: LayerLayout,
  size: number,
): GizmoZone {
  const px = uvX * size;
  const py = uvY * size;

  for (const h of GIZMO_HANDLES) {
    const { x: hx, y: hy } = layout.handles[h];
    if (Math.hypot(px - hx, py - hy) <= HANDLE_RADIUS) return h;
  }

  const b = layout.textBox;
  if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h)
    return "body";

  return null;
}

// Gizmo drawing helpers
function drawGizmoFrame(
  ctx: CanvasRenderingContext2D,
  box: LayerLayout["textBox"],
) {
  ctx.save();
  ctx.setLineDash([14, 8]);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 4;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.restore();
}

function drawHandle(
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  kind: GizmoHandle,
) {
  const r = HANDLE_RADIUS;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = kind === "delete" ? "#ef4444" : "#374151";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const s = 8;
  switch (kind) {
    case "copy":
      ctx.strokeRect(pos.x - s * 0.3, pos.y - s * 0.3, s * 0.85, s * 0.85);
      ctx.strokeRect(pos.x - s * 0.85, pos.y - s * 0.85, s * 0.85, s * 0.85);
      break;
    case "delete":
      ctx.beginPath();
      ctx.moveTo(pos.x - s, pos.y - s * 0.5);
      ctx.lineTo(pos.x + s, pos.y - s * 0.5);
      ctx.stroke();
      ctx.strokeRect(pos.x - s * 0.65, pos.y - s * 0.15, s * 1.3, s * 0.95);
      break;
    case "rotate":
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 0.55, 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x + s * 0.45, pos.y - s * 0.55);
      ctx.lineTo(pos.x + s * 0.75, pos.y - s * 0.2);
      ctx.lineTo(pos.x + s * 0.35, pos.y - s * 0.35);
      ctx.stroke();
      break;
    case "resize":
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
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: DesignLayer,
  size: number,
) {
  const text = layer.text ?? (layer.type === "number" ? "9" : "NAME");
  const font = resolveFont(layer.font ?? "--font-oswald");
  const fontSize = Math.round(
    (layer.fontSize ?? 128) * FONT_SCALE * (size / TEXTURE_SIZE_EDITOR),
  );
  const strokeWidth =
    (layer.strokeWidth ?? 4) * FONT_SCALE * (size / TEXTURE_SIZE_EDITOR);

  ctx.save();
  ctx.translate(layer.x * size, layer.y * size);
  ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
  ctx.font = `bold ${fontSize}px "${font}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor ?? "#1A2744";
    ctx.lineWidth = strokeWidth * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, 0, 0);
  }

  ctx.fillStyle = layer.textColor ?? "#FFFFFF";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Serialise only text-affecting fields (not selectedId) — used to detect if text cache is stale
function serialiseText(layers: DesignLayer[]): string {
  return JSON.stringify(layers.map((l) => ({
    id: l.id, text: l.text, font: l.font, fontSize: l.fontSize,
    textColor: l.textColor, strokeColor: l.strokeColor, strokeWidth: l.strokeWidth,
    x: l.x, y: l.y, rotation: l.rotation, visible: l.visible, type: l.type,
  })));
}

// Serialise selectedId separately to detect gizmo-only changes
function serialiseGizmo(selectedId: string | null): string {
  return selectedId ?? "";
}

// Draw all layers onto ctx without any gizmo overlay
function drawTextOnly(
  ctx: CanvasRenderingContext2D,
  layers: DesignLayer[],
  size: number,
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, size, size);
  for (const layer of layers) {
    if (!layer.visible) continue;
    if (layer.type !== "text" && layer.type !== "number") continue;
    drawLayer(ctx, layer, size);
  }
}

export function drawLayersDirect(
  canvas: HTMLCanvasElement,
  layers: DesignLayer[],
  selectedId: string | null = null,
  textCache?: HTMLCanvasElement | null,
): void {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);

  if (textCache) {
    // Fast path: blit cached text, then draw gizmo only
    ctx.drawImage(textCache, 0, 0);
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (const layer of layers) {
      if (!layer.visible) continue;
      if (layer.type !== "text" && layer.type !== "number") continue;
      drawLayer(ctx, layer, size);
    }
  }

  // Draw gizmo for selected layer
  if (selectedId) {
    const selected = layers.find((l) => l.id === selectedId);
    if (selected) {
      const layout = buildLayerLayout(ctx, selected, size);
      drawGizmoFrame(ctx, layout.textBox);
      for (const kind of GIZMO_HANDLES) {
        drawHandle(ctx, layout.handles[kind], kind);
      }
    }
  }
}

function createCanvasTexture(size: number): {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
} {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  return { canvas, texture };
}

export function useDesignTexture(zone: PrintZoneKey): {
  texture: THREE.CanvasTexture;
  invalidate: () => void;
} {
  const resolution = useConfiguratorStore((s) => s.textureSettings.resolution);

  // Initialise canvas + texture once (useMemo = safe during render, no ref mutation)
  const { canvas: initCanvas, texture: initTexture } = useMemo(() => {
    if (typeof document === "undefined") return { canvas: null, texture: null };
    return createCanvasTexture(resolution ?? TEXTURE_SIZE_EDITOR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable refs for use inside effects/callbacks only
  const canvasRef    = useRef(initCanvas);
  const textureRef   = useRef(initTexture);
  // Offscreen canvas caching rendered text pixels (no gizmo)
  const textCacheRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to store changes and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;

    const size = canvas.width;

    // Lazily create offscreen text-cache canvas matching main canvas size
    if (!textCacheRef.current && typeof document !== "undefined") {
      const tc = document.createElement("canvas");
      tc.width  = size;
      tc.height = size;
      textCacheRef.current = tc;
    }

    let lastTextSerial  = "";
    let lastGizmoSerial = "";
    let rafId: number | null = null;

    const redraw = () => {
      const state      = useConfiguratorStore.getState();
      const layers     = state.layers.filter((l) => l.zone === zone && l.visible);
      const selectedId = state.selectedId;

      const textSerial  = serialiseText(layers);
      const gizmoSerial = serialiseGizmo(selectedId);

      // Nothing changed at all — skip
      if (textSerial === lastTextSerial && gizmoSerial === lastGizmoSerial) return;

      // Text content/style/position changed — re-render text cache
      if (textSerial !== lastTextSerial) {
        lastTextSerial = textSerial;
        const tc  = textCacheRef.current;
        const tCtx = tc?.getContext("2d");
        if (tc && tCtx) drawTextOnly(tCtx, layers, size);
      }

      lastGizmoSerial = gizmoSerial;

      // Composite: blit text cache + draw gizmo
      drawLayersDirect(canvas, layers, selectedId, textCacheRef.current);
      texture.needsUpdate = true;
    };

    // Throttle redraws to one per animation frame
    const scheduleRedraw = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { rafId = null; redraw(); });
    };

    redraw();
    const unsub = useConfiguratorStore.subscribe(scheduleRedraw);
    return () => {
      unsub();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [zone]);

  // Dispose texture on unmount
  useEffect(() => {
    const texture = textureRef.current;
    return () => {
      texture?.dispose();
    };
  }, []);

  const invalidate = useCallback(() => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;
    const state = useConfiguratorStore.getState();
    const layers = state.layers.filter((l) => l.zone === zone && l.visible);
    drawLayersDirect(canvas, layers, state.selectedId);
    texture.needsUpdate = true;
  }, [zone]);

  // Return initTexture directly (stable useMemo value, no ref access during render)
  if (!initTexture) {
    const dummy = new THREE.CanvasTexture(document.createElement("canvas"));
    return { texture: dummy, invalidate };
  }

  return { texture: initTexture, invalidate };
}
