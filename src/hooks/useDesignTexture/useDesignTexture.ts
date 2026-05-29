"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import * as THREE from "three";

import {
  TEXTURE_SIZE_DRAG,
  TEXTURE_SIZE_EDITOR,
  UV0_BOUNDS,
} from "@utils";
import type { PrintZoneKey } from "@utils";
import { useConfiguratorStore } from "@store";
import type { DesignLayer } from "@store";

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

export interface LayerGlyph {
  canvas: HTMLCanvasElement;
  halfW: number;
  halfH: number;
  styleSerial: string;
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

function serialiseLayerStyle(layer: DesignLayer): string {
  return JSON.stringify({
    text: layer.text,
    font: layer.font,
    fontSize: layer.fontSize,
    textColor: layer.textColor,
    strokeColor: layer.strokeColor,
    strokeWidth: layer.strokeWidth,
    type: layer.type,
    visible: layer.visible,
  });
}

function serialiseLayersTransform(layers: DesignLayer[]): string {
  return JSON.stringify(
    layers.map((l) => ({
      id: l.id,
      x: l.x,
      y: l.y,
      rotation: l.rotation,
      zone: l.zone,
      visible: l.visible,
    })),
  );
}

function serialiseGizmo(selectedId: string | null): string {
  return selectedId ?? "";
}

function getDesignLayers(layers: DesignLayer[]): DesignLayer[] {
  return layers.filter(
    (l) => l.visible && (l.type === "text" || l.type === "number"),
  );
}

export function renderLayerGlyph(
  layer: DesignLayer,
  atlasSize: number,
): LayerGlyph {
  const text = layer.text ?? (layer.type === "number" ? "9" : "NAME");
  const font = resolveFont(layer.font ?? "--font-oswald");
  const fontSize = Math.round(
    (layer.fontSize ?? 128) * FONT_SCALE * (atlasSize / TEXTURE_SIZE_EDITOR),
  );
  const strokeWidth =
    (layer.strokeWidth ?? 4) * FONT_SCALE * (atlasSize / TEXTURE_SIZE_EDITOR);

  const measureCanvas = document.createElement("canvas");
  const mCtx = measureCanvas.getContext("2d")!;
  mCtx.font = `bold ${fontSize}px "${font}"`;
  const metrics = mCtx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize * 1.1;
  const pad = strokeWidth + 4;
  const w = Math.max(2, Math.ceil(textW + pad * 2));
  const h = Math.max(2, Math.ceil(textH + pad * 2));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontSize}px "${font}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor ?? "#1A2744";
    ctx.lineWidth = strokeWidth * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, w / 2, h / 2);
  }

  ctx.fillStyle = layer.textColor ?? "#FFFFFF";
  ctx.fillText(text, w / 2, h / 2);

  return {
    canvas,
    halfW: w / 2,
    halfH: h / 2,
    styleSerial: serialiseLayerStyle(layer),
  };
}

function drawLayerFromGlyph(
  ctx: CanvasRenderingContext2D,
  layer: DesignLayer,
  glyph: LayerGlyph,
  canvasSize: number,
): void {
  const cx = layer.x * canvasSize;
  const cy = layer.y * canvasSize;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
  ctx.drawImage(glyph.canvas, -glyph.halfW, -glyph.halfH);
  ctx.restore();
}

interface CompositeZoneOptions {
  showGizmo?: boolean;
  fast?: boolean;
}

function compositeZone(
  canvas: HTMLCanvasElement,
  layers: DesignLayer[],
  glyphMap: Map<string, LayerGlyph>,
  selectedId: string | null,
  options: CompositeZoneOptions = {},
): void {
  const { showGizmo = true, fast = false } = options;
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = !fast;
  if (!fast) ctx.imageSmoothingQuality = "high";

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
      for (const kind of GIZMO_HANDLES) {
        drawHandle(ctx, layout.handles[kind], kind);
      }
    }
  }
}

function applyTextureUploadMode(
  texture: THREE.CanvasTexture,
  interacting: boolean,
): void {
  const wantMipmaps = !interacting;
  if (texture.generateMipmaps === wantMipmaps) return;
  texture.generateMipmaps = wantMipmaps;
  texture.minFilter = wantMipmaps
    ? THREE.LinearMipmapLinearFilter
    : THREE.LinearFilter;
  texture.needsUpdate = true;
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
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return { canvas, texture };
}

const PRINT_ZONE_KEYS = Object.keys(UV0_BOUNDS) as PrintZoneKey[];
const DRAG_REDRAW_MS = 33;

const threeInvalidators = new Set<() => void>();

/** Hook into R3F `invalidate` so `frameloop="demand"` still updates the viewport. */
export function registerDesignRenderInvalidate(fn: () => void): () => void {
  threeInvalidators.add(fn);
  return () => threeInvalidators.delete(fn);
}

function requestThreeRender() {
  for (const fn of threeInvalidators) fn();
}

interface ZoneTarget {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

// ─── Singleton engine: per-zone canvas (0–1 part UV) + shared glyph cache ──

type DragPreview = Partial<Omit<DesignLayer, "id">> & { id: string };

class DesignTextureEngine {
  private readonly zoneTargets = new Map<PrintZoneKey, ZoneTarget>();
  private readonly glyphMap = new Map<string, LayerGlyph>();
  private rafId: number | null = null;
  private dragPreview: DragPreview | null = null;
  private interacting = false;
  private lastStyleSerial = "";
  private lastTransformSerial = "";
  private lastGizmoSerial = "";
  private lastInteracting = false;
  private readonly editorSize: number;
  private canvasSize: number;
  private lastRedrawAt = 0;
  private redrawRafId: number | null = null;

  constructor(size: number) {
    this.editorSize = size;
    this.canvasSize = size;
    for (const zone of PRINT_ZONE_KEYS) {
      this.zoneTargets.set(zone, createCanvasTexture(size));
    }
    this.redraw();
  }

  private setCanvasResolution(size: number) {
    if (this.canvasSize === size) return;
    this.canvasSize = size;
    for (const { canvas } of this.zoneTargets.values()) {
      canvas.width = size;
      canvas.height = size;
    }
    this.glyphMap.clear();
    this.lastStyleSerial = "";
  }

  getTexture(zone: PrintZoneKey): THREE.CanvasTexture {
    return this.zoneTargets.get(zone)!.texture;
  }

  setDragPreview(preview: DragPreview | null) {
    this.dragPreview = preview;
    this.scheduleRedraw();
  }

  setInteracting(active: boolean) {
    if (this.interacting === active) return;
    this.interacting = active;
    this.setCanvasResolution(active ? TEXTURE_SIZE_DRAG : this.editorSize);
    for (const { texture } of this.zoneTargets.values()) {
      applyTextureUploadMode(texture, active);
    }
    this.lastTransformSerial = "";
    this.scheduleRedraw();
  }

  private getEffectiveLayers(): DesignLayer[] {
    const base = getDesignLayers(useConfiguratorStore.getState().layers);
    if (!this.dragPreview) return base;
    const { id, ...patch } = this.dragPreview;
    return base.map((l) => (l.id === id ? { ...l, ...patch } : l));
  }

  scheduleRedraw() {
    if (this.interacting) {
      const elapsed = performance.now() - this.lastRedrawAt;
      if (elapsed < DRAG_REDRAW_MS) {
        if (this.redrawRafId !== null) return;
        this.redrawRafId = window.setTimeout(() => {
          this.redrawRafId = null;
          this.scheduleRedraw();
        }, DRAG_REDRAW_MS - elapsed);
        return;
      }
    }

    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.lastRedrawAt = performance.now();
      this.redraw();
    });
  }

  private syncGlyphs(layers: DesignLayer[]): boolean {
    let styleChanged = false;
    const liveIds = new Set(layers.map((l) => l.id));

    for (const id of this.glyphMap.keys()) {
      if (!liveIds.has(id)) {
        this.glyphMap.delete(id);
        styleChanged = true;
      }
    }

    for (const layer of layers) {
      const styleSerial = serialiseLayerStyle(layer);
      const cached = this.glyphMap.get(layer.id);
      if (cached && cached.styleSerial === styleSerial) continue;

      this.glyphMap.set(layer.id, renderLayerGlyph(layer, this.canvasSize));
      styleChanged = true;
    }

    return styleChanged;
  }

  redraw(): void {
    const state = useConfiguratorStore.getState();
    const layers = this.getEffectiveLayers();
    const selectedId = state.selectedId;

    const styleSerial = layers
      .map((l) => `${l.id}:${serialiseLayerStyle(l)}`)
      .join("|");
    const transformSerial = serialiseLayersTransform(layers);
    const gizmoSerial = serialiseGizmo(selectedId);

    const styleDirty = styleSerial !== this.lastStyleSerial;
    const transformDirty = transformSerial !== this.lastTransformSerial;
    const gizmoDirty = gizmoSerial !== this.lastGizmoSerial;
    const interactingDirty = this.interacting !== this.lastInteracting;

    if (!styleDirty && !transformDirty && !gizmoDirty && !interactingDirty) {
      return;
    }

    if (styleDirty) {
      this.syncGlyphs(layers);
      this.lastStyleSerial = styleSerial;
    }

    if (styleDirty || transformDirty || gizmoDirty || interactingDirty) {
      const zonesToDraw = new Set(layers.map((l) => l.zone));
      const fast = this.interacting;

      for (const zone of zonesToDraw) {
        const zoneLayers = layers.filter((l) => l.zone === zone);
        const target = this.zoneTargets.get(zone)!;
        const zoneSelected =
          !fast && selectedId && zoneLayers.some((l) => l.id === selectedId)
            ? selectedId
            : null;
        compositeZone(target.canvas, zoneLayers, this.glyphMap, zoneSelected, {
          showGizmo: !fast,
          fast,
        });
        target.texture.needsUpdate = true;
      }

      this.lastTransformSerial = transformSerial;
      this.lastGizmoSerial = gizmoSerial;
      this.lastInteracting = this.interacting;
      requestThreeRender();
    }
  }

  invalidate() {
    this.lastStyleSerial = "";
    this.lastTransformSerial = "";
    this.lastGizmoSerial = "";
    this.redraw();
  }

  dispose() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.redrawRafId !== null) clearTimeout(this.redrawRafId);
    for (const { texture } of this.zoneTargets.values()) texture.dispose();
    this.zoneTargets.clear();
    this.glyphMap.clear();
    this.dragPreview = null;
  }
}

let storeSubscribed = false;
let designDragActive = false;

function ensureStoreSubscription() {
  if (storeSubscribed || typeof document === "undefined") return;
  storeSubscribed = true;
  useConfiguratorStore.subscribe(() => {
    if (designDragActive) return;
    engine?.scheduleRedraw();
  });
}

function initEngine(): DesignTextureEngine {
  if (!engine) {
    const resolution =
      useConfiguratorStore.getState().textureSettings.resolution ??
      TEXTURE_SIZE_EDITOR;
    engine = new DesignTextureEngine(resolution);
    ensureStoreSubscription();
  }
  return engine;
}

/** Live drag preview — no Zustand updates per frame. */
export function setDesignDragPreview(preview: DragPreview | null) {
  designDragActive = preview !== null;
  initEngine().setDragPreview(preview);
}

export function setDesignInteracting(active: boolean) {
  initEngine().setInteracting(active);
}

export function clearDesignDragPreview() {
  designDragActive = false;
  engine?.setDragPreview(null);
}

let engine: DesignTextureEngine | null = null;
let engineRefCount = 0;

const engineListeners = new Set<() => void>();

function subscribeDesignEngine(onStoreChange: () => void): () => void {
  engineListeners.add(onStoreChange);
  return () => engineListeners.delete(onStoreChange);
}

function notifyDesignEngineListeners() {
  for (const listener of engineListeners) listener();
}

const SSR_DUMMY_TEXTURE =
  typeof document !== "undefined"
    ? new THREE.CanvasTexture(document.createElement("canvas"))
    : (null as unknown as THREE.CanvasTexture);

/** Per-zone design texture — stable ref, canvas updates without React re-renders. */
export function useDesignTexture(zone: PrintZoneKey): {
  texture: THREE.CanvasTexture;
  invalidate: () => void;
} {
  const texture = useSyncExternalStore(
    subscribeDesignEngine,
    () =>
      typeof document === "undefined" || !engine
        ? SSR_DUMMY_TEXTURE
        : engine.getTexture(zone),
    () => SSR_DUMMY_TEXTURE,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    engineRefCount++;
    initEngine();
    notifyDesignEngineListeners();
    return () => {
      engineRefCount = Math.max(0, engineRefCount - 1);
      if (engineRefCount === 0) {
        engine?.dispose();
        engine = null;
        storeSubscribed = false;
      }
      notifyDesignEngineListeners();
    };
  }, [zone]);

  const invalidate = useCallback(() => {
    engine?.invalidate();
  }, []);

  return { texture, invalidate };
}

/** @deprecated Use useDesignTexture(zone) */
export function useSharedDesignTexture(): {
  texture: THREE.CanvasTexture;
  invalidate: () => void;
} {
  return useDesignTexture("back");
}

/** @deprecated Kept for callers that imported drawLayersDirect */
export function drawLayersDirect(
  canvas: HTMLCanvasElement,
  layers: DesignLayer[],
  selectedId: string | null = null,
): void {
  const glyphMap = new Map<string, LayerGlyph>();
  const size = canvas.width;
  for (const layer of layers) {
    if (!layer.visible || (layer.type !== "text" && layer.type !== "number"))
      continue;
    glyphMap.set(layer.id, renderLayerGlyph(layer, size));
  }
  compositeZone(canvas, layers, glyphMap, selectedId);
}
