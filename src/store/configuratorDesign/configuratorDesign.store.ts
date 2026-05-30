import { create } from 'zustand';

import { PRINT_ZONES, TEXTURE_SIZE_EDITOR } from '@utils';
import type { DesignLayer, PrintZoneKey, TextureSettings } from '@types';

const MAX_HISTORY = 50;

interface ConfiguratorState {
  layers: DesignLayer[];
  activeZone: PrintZoneKey;
  textureSettings: TextureSettings;
  _past: DesignLayer[][];
  _future: DesignLayer[][];
}

interface ConfiguratorActions {
  addLayer: (layer: Omit<DesignLayer, 'id'>, options?: { select?: boolean }) => string;
  updateLayer: (id: string, patch: Partial<Omit<DesignLayer, 'id'>>) => void;
  removeLayer: (id: string) => void;
  setActiveZone: (zone: PrintZoneKey) => void;
  toggleVisible: (id: string) => void;
  toggleLocked: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setTextureSettings: (patch: Partial<TextureSettings>) => void;
  getLayer: (id: string) => DesignLayer | undefined;
  getLayersForZone: (zone: PrintZoneKey) => DesignLayer[];
}

type ConfiguratorStore = ConfiguratorState & ConfiguratorActions;

const newId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `layer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const zoneCentre = (zone: PrintZoneKey): { x: number; y: number } => {
  const z = PRINT_ZONES[zone];
  return { x: z.x + z.w / 2, y: z.y + z.h / 2 };
};

const snapshot = (state: ConfiguratorState): DesignLayer[] => state.layers.map((l) => ({ ...l }));

const pushHistory = (state: ConfiguratorState): Pick<ConfiguratorState, '_past' | '_future'> => {
  const past = [...state._past, snapshot(state)].slice(-MAX_HISTORY);
  return { _past: past, _future: [] };
};

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  layers: [],
  activeZone: 'front',
  textureSettings: { resolution: TEXTURE_SIZE_EDITOR, transparentBackground: true },
  _past: [],
  _future: [],

  addLayer: (layer, options) => {
    const id = newId();
    const centre = zoneCentre(layer.zone);
    const full: DesignLayer = Object.assign({ x: centre.x, y: centre.y, scaleX: 0.2, scaleY: 0.1, rotation: 0, visible: true, locked: false }, layer, { id });
    set((s) => ({ ...pushHistory(s), layers: [...s.layers, full] }));
    return id;
  },

  updateLayer: (id, patch) => {
    set((s) => ({ ...pushHistory(s), layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },

  removeLayer: (id) => {
    set((s) => ({ ...pushHistory(s), layers: s.layers.filter((l) => l.id !== id) }));
  },

  setActiveZone: (zone) => set({ activeZone: zone }),

  toggleVisible: (id) => set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) })),
  toggleLocked: (id) => set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)) })),

  bringForward: (id) =>
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx === -1 || idx === s.layers.length - 1) return s;
      const layers = [...s.layers];
      [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
      return { layers };
    }),

  sendBackward: (id) =>
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx <= 0) return s;
      const layers = [...s.layers];
      [layers[idx - 1], layers[idx]] = [layers[idx], layers[idx - 1]];
      return { layers };
    }),

  undo: () =>
    set((s) => {
      if (!s._past.length) return s;
      const past = [...s._past];
      const layers = past.pop()!;
      const _future = [snapshot(s), ...s._future].slice(0, MAX_HISTORY);
      return { layers, _past: past, _future };
    }),

  redo: () =>
    set((s) => {
      if (!s._future.length) return s;
      const future = [...s._future];
      const layers = future.shift()!;
      const _past = [...s._past, snapshot(s)].slice(-MAX_HISTORY);
      return { layers, _past, _future: future };
    }),

  canUndo: () => get()._past.length > 0,
  canRedo: () => get()._future.length > 0,

  setTextureSettings: (patch) => set((s) => ({ textureSettings: { ...s.textureSettings, ...patch } })),

  getLayer: (id) => get().layers.find((l) => l.id === id),
  getLayersForZone: (zone) => get().layers.filter((l) => l.zone === zone && l.visible),
}));
