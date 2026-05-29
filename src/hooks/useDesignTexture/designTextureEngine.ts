import * as THREE from 'three';

import { useConfiguratorStore } from '@store';
import {
  applyTextureUploadMode,
  compositeZone,
  createCanvasTexture,
  getDesignLayers,
  renderLayerGlyph,
  serialiseGizmo,
  serialiseLayersTransform,
  serialiseLayerStyle,
  TEXTURE_SIZE_DRAG,
  UV0_BOUNDS,
} from '@utils';
import type { DesignLayer, LayerGlyph, PrintZoneKey } from '@types';

const PRINT_ZONE_KEYS = Object.keys(UV0_BOUNDS) as PrintZoneKey[];
const DRAG_REDRAW_MS = 33;

interface ZoneTarget {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

type DragPreview = Partial<Omit<DesignLayer, 'id'>> & { id: string };

class DesignTextureEngine {
  private readonly zoneTargets = new Map<PrintZoneKey, ZoneTarget>();
  private readonly glyphMap = new Map<string, LayerGlyph>();
  private rafId: number | null = null;
  private dragPreview: DragPreview | null = null;
  private interacting = false;
  private lastStyleSerial = '';
  private lastTransformSerial = '';
  private lastGizmoSerial = '';
  private lastInteracting = false;
  private readonly editorSize: number;
  private canvasSize: number;
  private lastRedrawAt = 0;
  private redrawRafId: number | null = null;

  constructor(
    size: number,
    private readonly onTexturesUpdated: () => void = () => {},
  ) {
    this.editorSize = size;
    this.canvasSize = size;
    for (const zone of PRINT_ZONE_KEYS) this.zoneTargets.set(zone, createCanvasTexture(size));
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
    this.lastStyleSerial = '';
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
    for (const { texture } of this.zoneTargets.values()) applyTextureUploadMode(texture, active);
    this.lastTransformSerial = '';
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
    const styleSerial = layers.map((l) => `${l.id}:${serialiseLayerStyle(l)}`).join('|');
    const transformSerial = serialiseLayersTransform(layers);
    const gizmoSerial = serialiseGizmo(selectedId);
    const styleDirty = styleSerial !== this.lastStyleSerial;
    const transformDirty = transformSerial !== this.lastTransformSerial;
    const gizmoDirty = gizmoSerial !== this.lastGizmoSerial;
    const interactingDirty = this.interacting !== this.lastInteracting;
    if (!styleDirty && !transformDirty && !gizmoDirty && !interactingDirty) return;
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
        const zoneSelected = !fast && selectedId && zoneLayers.some((l) => l.id === selectedId) ? selectedId : null;
        compositeZone(target.canvas, zoneLayers, this.glyphMap, zoneSelected, { showGizmo: !fast, fast });
        target.texture.needsUpdate = true;
      }
      this.lastTransformSerial = transformSerial;
      this.lastGizmoSerial = gizmoSerial;
      this.lastInteracting = this.interacting;
      this.onTexturesUpdated();
    }
  }

  invalidate() {
    this.lastStyleSerial = '';
    this.lastTransformSerial = '';
    this.lastGizmoSerial = '';
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

export type { DragPreview };
export { DesignTextureEngine };
