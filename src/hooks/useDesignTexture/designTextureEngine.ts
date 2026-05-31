import * as THREE from 'three';

import { useConfiguratorStore, useStepsStore } from '@store';
import type { PositionSlot } from '@utils';
import {
  applyTextureUploadMode,
  compositeZone,
  createCanvasTexture,
  getDesignLayers,
  isLayerEditableOnStep,
  renderLayerGlyph,
  serialiseLayersTransform,
  serialiseLayerStyle,
  setCompositeScheduleRedraw,
  TEXTURE_SIZE_DRAG,
  UV0_BOUNDS,
} from '@utils';
import type { DesignLayer, LayerGlyph, PrintZoneKey } from '@types';

type DragPreview = Partial<Omit<DesignLayer, 'id'>> & { id: string };

const PRINT_ZONE_KEYS = Object.keys(UV0_BOUNDS) as PrintZoneKey[];
const DRAG_REDRAW_MS = 40; // ~25fps during drag

interface ZoneTarget {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

class DesignTextureEngine {
  private readonly zoneTargets = new Map<PrintZoneKey, ZoneTarget>();
  private readonly glyphMap = new Map<string, LayerGlyph>();
  private rafId: number | null = null;
  private redrawRafId: ReturnType<typeof setTimeout> | null = null;
  private dragPreview: DragPreview | null = null;
  private interacting = false;
  private lastInteracting = false;
  private lastStyleSerial = '';
  private lastTransformSerial = '';
  private lastGizmoSerial = '';
  private lastSlotsSerial = '';
  private readonly zoneSlots = new Map<PrintZoneKey, PositionSlot[]>();
  private readonly editorSize: number;
  private canvasSize: number;
  private lastRedrawAt = 0;

  constructor(
    size: number,
    private readonly onTexturesUpdated: () => void = () => {},
  ) {
    this.editorSize = size;
    this.canvasSize = size;
    // Image load completes without changing layer serials — force a redraw.
    setCompositeScheduleRedraw(() => {
      this.lastStyleSerial = '';
      this.scheduleRedraw();
    });
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

  setDragPreview(preview: DragPreview | null): void {
    this.dragPreview = preview;
    this.scheduleRedraw();
  }

  setInteracting(active: boolean): void {
    if (this.interacting === active) return;
    this.interacting = active;
    this.setCanvasResolution(active ? TEXTURE_SIZE_DRAG : this.editorSize);
    for (const { texture } of this.zoneTargets.values()) applyTextureUploadMode(texture, active);
    this.lastTransformSerial = '';
    this.scheduleRedraw();
  }

  setSlots(zone: PrintZoneKey, slots: PositionSlot[]): void {
    this.zoneSlots.set(zone, slots);
    this.lastSlotsSerial = '';
    this.scheduleRedraw();
  }

  private getEffectiveLayers(): DesignLayer[] {
    const base = getDesignLayers(useConfiguratorStore.getState().layers);
    if (!this.dragPreview) return base;
    const { id, ...patch } = this.dragPreview;
    return base.map((l) => (l.id === id ? { ...l, ...patch } : l));
  }

  scheduleRedraw(): void {
    if (this.interacting) {
      const elapsed = performance.now() - this.lastRedrawAt;
      if (elapsed < DRAG_REDRAW_MS) {
        if (this.redrawRafId !== null) return;
        this.redrawRafId = setTimeout(() => {
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
      if (layer.type === 'logo') continue; // logos drawn directly without glyph cache
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
    const activeStep = useStepsStore.getState().currentStepValue;
    const selectedId = state.selectedId ?? null;
    const styleSerial = layers.map((l) => `${l.id}:${serialiseLayerStyle(l)}`).join('|');
    const transformSerial = serialiseLayersTransform(layers);
    const selectedLayer = selectedId ? layers.find((l) => l.id === selectedId) : null;
    const stepMatches = selectedLayer ? isLayerEditableOnStep(selectedLayer, activeStep) : false;
    const gizmoSerial = `${activeStep}:${stepMatches ? selectedId : ''}`;
    const slotsSerial = [...this.zoneSlots.entries()].map(([z, s]) => `${z}:${s.length}`).join('|');
    const styleDirty = styleSerial !== this.lastStyleSerial;
    const transformDirty = transformSerial !== this.lastTransformSerial;
    const gizmoDirty = gizmoSerial !== this.lastGizmoSerial;
    const slotsDirty = slotsSerial !== this.lastSlotsSerial;
    const interactingDirty = this.interacting !== this.lastInteracting;
    if (!styleDirty && !transformDirty && !gizmoDirty && !slotsDirty && !interactingDirty) return;
    if (styleDirty) {
      this.syncGlyphs(layers);
      this.lastStyleSerial = styleSerial;
    }
    const zonesToDraw = new Set(layers.map((l) => l.zone));
    // also redraw zones with slots
    for (const zone of this.zoneSlots.keys()) zonesToDraw.add(zone);
    const fast = this.interacting;
    for (const zone of zonesToDraw) {
      const zoneLayers = layers.filter((l) => l.zone === zone);
      const target = this.zoneTargets.get(zone);
      if (!target) continue;
      const slots = this.zoneSlots.get(zone) ?? [];
      const selectedLayer = selectedId ? layers.find((l) => l.id === selectedId) : null;
      const isInteractive = selectedLayer?.interactive !== false;
      const showGizmo = stepMatches && isInteractive && !fast;
      const zoneSelected = showGizmo && selectedId && zoneLayers.some((l) => l.id === selectedId) ? selectedId : null;
      compositeZone(target.canvas, zoneLayers, this.glyphMap, zoneSelected, { showGizmo, fast }, slots);
      target.texture.needsUpdate = true;
    }
    this.lastTransformSerial = transformSerial;
    this.lastGizmoSerial = gizmoSerial;
    this.lastSlotsSerial = slotsSerial;
    this.lastInteracting = this.interacting;
    this.onTexturesUpdated();
  }

  invalidate(): void {
    this.lastStyleSerial = '';
    this.lastTransformSerial = '';
    this.lastGizmoSerial = '';
    this.lastSlotsSerial = '';
    this.dragPreview = null;
    this.redraw();
  }

  dispose(): void {
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
