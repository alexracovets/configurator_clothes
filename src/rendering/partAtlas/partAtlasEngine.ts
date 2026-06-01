import * as THREE from 'three';

import { useColorStore, useConfiguratorStore, useGarmentStore, useGradientStore, usePatternStore, useStepsStore } from '@store';
import type { PositionSlot } from '@utils';
import {
  applyTextureUploadMode,
  createCanvasTexture,
  getDesignLayers,
  isLayerEditableOnStep,
  renderLayerGlyph,
  serialiseLayersTransform,
  serialiseLayerStyle,
  setCompositeScheduleRedraw,
  TEXTURE_SIZE_DRAG,
} from '@utils';
import type { ConfiguratorPart, DesignLayer, LayerGlyph, PrintZoneKey } from '@types';

import { getGarmentConfig } from '@data';

import { getSvgCanvas, loadSvgTexture } from '../../hooks/useSvgTexture/useSvgTexture';
import { composePartAtlas } from './composePartAtlas';

type DragPreview = Partial<Omit<DesignLayer, 'id'>> & { id: string };

const DRAG_REDRAW_MS = 40;

interface PartTarget {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

class PartAtlasEngine {
  private readonly partTargets = new Map<string, PartTarget>();
  private readonly glyphMap = new Map<string, LayerGlyph>();
  private readonly zoneSlots = new Map<PrintZoneKey, PositionSlot[]>();
  private rafId: number | null = null;
  private redrawRafId: ReturnType<typeof setTimeout> | null = null;
  private dragPreview: DragPreview | null = null;
  private interacting = false;
  private lastInteracting = false;
  private lastStyleSerial = '';
  private lastTransformSerial = '';
  private lastGizmoSerial = '';
  private lastSlotsSerial = '';
  private lastVisualSerial = '';
  private lastPartsKey = '';
  private readonly editorSize: number;
  private canvasSize: number;
  private lastRedrawAt = 0;
  private pendingPatternUrls = new Set<string>();

  constructor(
    size: number,
    private readonly onTexturesUpdated: () => void = () => {},
  ) {
    this.editorSize = size;
    this.canvasSize = size;
    setCompositeScheduleRedraw(() => {
      this.lastStyleSerial = '';
      this.scheduleRedraw();
    });
    this.syncPartTargets();
    this.redraw();
  }

  private getActiveParts(): ConfiguratorPart[] {
    const { styleId, activeGarment } = useGarmentStore.getState();
    return getGarmentConfig(styleId, activeGarment).parts.map((p) => p.key as ConfiguratorPart);
  }

  private syncPartTargets(): void {
    const parts = this.getActiveParts();
    const partsKey = parts.join('|');
    if (partsKey === this.lastPartsKey) return;
    this.lastPartsKey = partsKey;

    for (const key of this.partTargets.keys()) {
      if (!parts.includes(key as ConfiguratorPart)) {
        const target = this.partTargets.get(key)!;
        target.texture.dispose();
        this.partTargets.delete(key);
      }
    }

    for (const part of parts) {
      if (!this.partTargets.has(part)) {
        this.partTargets.set(part, createCanvasTexture(this.canvasSize));
      }
    }
  }

  private setCanvasResolution(size: number): void {
    if (this.canvasSize === size) return;
    this.canvasSize = size;
    for (const { canvas } of this.partTargets.values()) {
      canvas.width = size;
      canvas.height = size;
    }
    this.glyphMap.clear();
    this.lastStyleSerial = '';
  }

  getTexture(part: PrintZoneKey): THREE.CanvasTexture {
    this.syncPartTargets();
    const target = this.partTargets.get(part);
    if (!target) {
      const created = createCanvasTexture(this.canvasSize);
      this.partTargets.set(part, created);
      return created.texture;
    }
    return target.texture;
  }

  setDragPreview(preview: DragPreview | null): void {
    this.dragPreview = preview;
    this.scheduleRedraw();
  }

  setInteracting(active: boolean): void {
    if (this.interacting === active) return;
    this.interacting = active;
    this.setCanvasResolution(active ? TEXTURE_SIZE_DRAG : this.editorSize);
    for (const { texture } of this.partTargets.values()) applyTextureUploadMode(texture, active);
    this.lastTransformSerial = '';
    this.lastVisualSerial = '';
    this.redraw();
  }

  setSlots(zone: PrintZoneKey, slots: PositionSlot[]): void {
    this.zoneSlots.set(zone, slots);
    this.lastSlotsSerial = '';
    this.scheduleRedraw();
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

  private getEffectiveLayers(): DesignLayer[] {
    const base = getDesignLayers(useConfiguratorStore.getState().layers);
    if (!this.dragPreview) return base;
    const { id, ...patch } = this.dragPreview;
    return base.map((l) => (l.id === id ? { ...l, ...patch } : l));
  }

  private getVisualSerial(): string {
    const { styleId, activeGarment } = useGarmentStore.getState();
    const colors = useColorStore.getState().colorsByGarment[activeGarment];
    const gradients = useGradientStore.getState().gradientsByGarment[activeGarment];
    const pattern = usePatternStore.getState().patternByGarment[activeGarment];
    return JSON.stringify({ styleId, activeGarment, colors, gradients, pattern });
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
      if (layer.type === 'logo') continue;
      const styleSerial = serialiseLayerStyle(layer);
      const cached = this.glyphMap.get(layer.id);
      if (cached && cached.styleSerial === styleSerial) continue;
      this.glyphMap.set(layer.id, renderLayerGlyph(layer, this.canvasSize));
      styleChanged = true;
    }
    return styleChanged;
  }

  private ensurePatternLoaded(url: string): HTMLCanvasElement | null {
    if (!url) return null;
    const cached = getSvgCanvas(url);
    if (cached) return cached;
    if (!this.pendingPatternUrls.has(url)) {
      this.pendingPatternUrls.add(url);
      void loadSvgTexture(url).then(() => {
        this.pendingPatternUrls.delete(url);
        this.lastVisualSerial = '';
        this.scheduleRedraw();
      });
    }
    return null;
  }

  redraw(): void {
    this.syncPartTargets();

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
    const visualSerial = this.getVisualSerial();

    const styleDirty = styleSerial !== this.lastStyleSerial;
    const transformDirty = transformSerial !== this.lastTransformSerial;
    const gizmoDirty = gizmoSerial !== this.lastGizmoSerial;
    const slotsDirty = slotsSerial !== this.lastSlotsSerial;
    const visualDirty = visualSerial !== this.lastVisualSerial;
    const interactingDirty = this.interacting !== this.lastInteracting;

    if (!styleDirty && !transformDirty && !gizmoDirty && !slotsDirty && !visualDirty && !interactingDirty) return;

    if (styleDirty) {
      this.syncGlyphs(layers);
      this.lastStyleSerial = styleSerial;
    }

    const { styleId, activeGarment } = useGarmentStore.getState();
    const garmentConfig = getGarmentConfig(styleId, activeGarment);
    const colors = useColorStore.getState().colorsByGarment[activeGarment];
    const gradients = useGradientStore.getState().gradientsByGarment[activeGarment];
    const patternState = usePatternStore.getState().patternByGarment[activeGarment];
    const patternCanvas = patternState.patternUrl ? this.ensurePatternLoaded(patternState.patternUrl) : null;

    const fast = this.interacting;

    for (const { key: part } of garmentConfig.parts) {
      const target = this.partTargets.get(part);
      if (!target) continue;

      const baseColor = colors[part] ?? '#ffffff';
      const gradient = gradients[part] ?? {
        enabled: false,
        color2: '#111111',
        rotation: 0,
        position: 100,
        softness: 100,
        opacity: 100,
      };

      const slots = this.zoneSlots.get(part as PrintZoneKey) ?? [];
      let partSelectedId: string | null = null;
      if (stepMatches && selectedId) {
        const sel = layers.find((l) => l.id === selectedId);
        if (sel?.zone === part) partSelectedId = selectedId;
        else if (sel?.type === 'logo' && sel.zone === 'full' && ['front', 'back', 'left', 'right'].includes(part)) {
          partSelectedId = selectedId;
        }
      }
      const isInteractive = selectedLayer?.interactive !== false;
      const showGizmo = stepMatches && isInteractive && !fast && partSelectedId !== null;

      composePartAtlas({
        canvas: target.canvas,
        baseColor,
        gradient,
        patternCanvas,
        patternColor: patternState.patternColor,
        patternOpacity: patternState.patternOpacity,
        designLayers: layers,
        glyphMap: this.glyphMap,
        part: part as ConfiguratorPart,
        scheduleRedraw: () => this.scheduleRedraw(),
        designOptions: {
          showGizmo,
          fast,
          selectedId: partSelectedId,
          slots,
        },
      });

      target.texture.needsUpdate = true;
    }

    this.lastTransformSerial = transformSerial;
    this.lastGizmoSerial = gizmoSerial;
    this.lastSlotsSerial = slotsSerial;
    this.lastVisualSerial = visualSerial;
    this.lastInteracting = this.interacting;
    this.onTexturesUpdated();
  }

  invalidate(): void {
    this.lastStyleSerial = '';
    this.lastTransformSerial = '';
    this.lastGizmoSerial = '';
    this.lastSlotsSerial = '';
    this.lastVisualSerial = '';
    this.dragPreview = null;
    this.redraw();
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.redrawRafId !== null) clearTimeout(this.redrawRafId);
    for (const { texture } of this.partTargets.values()) texture.dispose();
    this.partTargets.clear();
    this.glyphMap.clear();
    this.dragPreview = null;
  }
}

export type { DragPreview };
export { PartAtlasEngine };
