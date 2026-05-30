import * as THREE from 'three';

import { useConfiguratorStore } from '@store';
import type { PositionSlot } from '@utils';
import {
  applyTextureUploadMode,
  compositeZone,
  createCanvasTexture,
  getDesignLayers,
  renderLayerGlyph,
  serialiseLayersTransform,
  serialiseLayerStyle,
  TEXTURE_SIZE_DRAG,
  UV0_BOUNDS,
} from '@utils';
import type { DesignLayer, LayerGlyph, PrintZoneKey } from '@types';

const PRINT_ZONE_KEYS = Object.keys(UV0_BOUNDS) as PrintZoneKey[];

interface ZoneTarget {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

class DesignTextureEngine {
  private readonly zoneTargets = new Map<PrintZoneKey, ZoneTarget>();
  private readonly glyphMap = new Map<string, LayerGlyph>();
  private rafId: number | null = null;
  private lastStyleSerial = '';
  private lastTransformSerial = '';
  private readonly zoneSlots = new Map<PrintZoneKey, PositionSlot[]>();
  private interacting = false;
  private currentSize: number;

  constructor(
    private readonly editorSize: number,
    private readonly onTexturesUpdated: () => void = () => {},
  ) {
    this.currentSize = editorSize;
    for (const zone of PRINT_ZONE_KEYS) this.zoneTargets.set(zone, createCanvasTexture(editorSize));
    this.redraw();
  }

  getTexture(zone: PrintZoneKey): THREE.CanvasTexture {
    return this.zoneTargets.get(zone)!.texture;
  }

  setInteracting(active: boolean): void {
    if (this.interacting === active) return;
    this.interacting = active;
    const size = active ? TEXTURE_SIZE_DRAG : this.editorSize;
    if (size !== this.currentSize) {
      this.currentSize = size;
      for (const { canvas } of this.zoneTargets.values()) {
        canvas.width = size;
        canvas.height = size;
      }
      this.glyphMap.clear();
      this.lastStyleSerial = '';
    }
    for (const { texture } of this.zoneTargets.values()) applyTextureUploadMode(texture, active);
    this.scheduleRedraw();
  }

  setSlots(zone: PrintZoneKey, slots: PositionSlot[]): void {
    this.zoneSlots.set(zone, slots);
    this.lastTransformSerial = '';
    this.scheduleRedraw();
  }

  scheduleRedraw() {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
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
      this.glyphMap.set(layer.id, renderLayerGlyph(layer, this.currentSize));
      styleChanged = true;
    }
    return styleChanged;
  }

  redraw(): void {
    const layers = getDesignLayers(useConfiguratorStore.getState().layers);
    const styleSerial = layers.map((l) => `${l.id}:${serialiseLayerStyle(l)}`).join('|');
    const transformSerial = serialiseLayersTransform(layers);
    if (styleSerial === this.lastStyleSerial && transformSerial === this.lastTransformSerial) return;
    if (styleSerial !== this.lastStyleSerial) {
      this.syncGlyphs(layers);
      this.lastStyleSerial = styleSerial;
    }
    const zonesToDraw = new Set(layers.map((l) => l.zone));
    for (const [zone, target] of this.zoneTargets) {
      const zoneLayers = layers.filter((l) => l.zone === zone);
      if (!zonesToDraw.has(zone)) {
        const ctx = target.canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, target.canvas.width, target.canvas.height);
      } else {
        compositeZone(target.canvas, zoneLayers, this.glyphMap, this.zoneSlots.get(zone) ?? []);
      }
      target.texture.needsUpdate = true;
    }
    this.lastTransformSerial = transformSerial;
    this.onTexturesUpdated();
  }

  invalidate() {
    this.lastStyleSerial = '';
    this.lastTransformSerial = '';
    this.redraw();
  }

  dispose() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    for (const { texture } of this.zoneTargets.values()) texture.dispose();
    this.zoneTargets.clear();
    this.glyphMap.clear();
  }
}

export { DesignTextureEngine };
