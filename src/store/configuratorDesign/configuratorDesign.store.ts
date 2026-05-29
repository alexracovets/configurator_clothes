import { create } from "zustand";

import { PRINT_ZONES, type PrintZoneKey, TEXTURE_SIZE_EDITOR } from "@utils";

export const FONTS = [
  { label: "Serie EA",      value: "--font-oswald",        canvasFont: "Oswald" },
  { label: "Bebas Neue",    value: "--font-bebas-neue",    canvasFont: "Bebas Neue" },
  { label: "Anton",         value: "--font-anton",         canvasFont: "Anton" },
  { label: "Russo One",     value: "--font-russo-one",     canvasFont: "Russo One" },
  { label: "Black Ops One", value: "--font-black-ops-one", canvasFont: "Black Ops One" },
] as const;

export type FontValue = (typeof FONTS)[number]["value"];

export const CSS_VAR_TO_CANVAS_FONT: Record<string, string> = Object.fromEntries(FONTS.map((f) => [f.value, f.canvasFont]));

export function resolveCanvasFont(cssVar: string): string {
  return CSS_VAR_TO_CANVAS_FONT[cssVar] ?? cssVar;
}

export type LayerType = "text" | "number" | "logo";

export interface DesignLayer {
  id: string;
  type: LayerType;
  zone: PrintZoneKey;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  visible: boolean;
  locked: boolean;
  text?: string;
  font?: string;
  fontSize?: number;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  src?: string;
}

export interface TextureSettings {
  resolution: number;
  transparentBackground: boolean;
}

const MAX_HISTORY = 50;

interface ConfiguratorState {
  layers: DesignLayer[];
  selectedId: string | null;
  activeZone: PrintZoneKey;
  textureSettings: TextureSettings;
  isInteracting: boolean;
  _past: DesignLayer[][];
  _future: DesignLayer[][];
}

interface ConfiguratorActions {
  addLayer: (layer: Omit<DesignLayer, "id">, options?: { select?: boolean }) => string;
  updateLayer: (id: string, patch: Partial<Omit<DesignLayer, "id">>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
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
  setInteracting: (interacting: boolean) => void;
  getLayer: (id: string) => DesignLayer | undefined;
  getLayersForZone: (zone: PrintZoneKey) => DesignLayer[];
}

type ConfiguratorStore = ConfiguratorState & ConfiguratorActions;

const newId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `layer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function zoneCentre(zone: PrintZoneKey): { x: number; y: number } {
  const z = PRINT_ZONES[zone];
  return { x: z.x + z.w / 2, y: z.y + z.h / 2 };
}

function snapshot(state: ConfiguratorState): DesignLayer[] {
  return state.layers.map((l) => ({ ...l }));
}

function pushHistory(state: ConfiguratorState): Pick<ConfiguratorState, "_past" | "_future"> {
  const past = [...state._past, snapshot(state)].slice(-MAX_HISTORY);
  return { _past: past, _future: [] };
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  layers: [],
  selectedId: null,
  activeZone: "front",
  textureSettings: { resolution: TEXTURE_SIZE_EDITOR, transparentBackground: true },
  isInteracting: false,
  _past: [],
  _future: [],

  addLayer: (layer, options) => {
    const id = newId();
    const centre = zoneCentre(layer.zone);
    const full: DesignLayer = Object.assign({ x: centre.x, y: centre.y, scaleX: 0.2, scaleY: 0.1, rotation: 0, visible: true, locked: false }, layer, { id });
    set((s) => ({ ...pushHistory(s), layers: [...s.layers, full], selectedId: options?.select === false ? s.selectedId : id }));
    return id;
  },

  updateLayer: (id, patch) => { set((s) => ({ ...pushHistory(s), layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) })); },

  removeLayer: (id) => { set((s) => ({ ...pushHistory(s), layers: s.layers.filter((l) => l.id !== id), selectedId: s.selectedId === id ? null : s.selectedId })); },

  duplicateLayer: (id) => {
    const source = get().layers.find((l) => l.id === id);
    if (!source) return;
    const newLayer: DesignLayer = { ...source, id: newId(), x: Math.min(1, source.x + 0.03), y: Math.min(1, source.y + 0.03) };
    set((s) => ({ ...pushHistory(s), layers: [...s.layers, newLayer], selectedId: newLayer.id }));
  },

  selectLayer: (id) => set({ selectedId: id }),
  setActiveZone: (zone) => set({ activeZone: zone }),

  toggleVisible: (id) => set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) })),
  toggleLocked: (id) => set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)) })),

  bringForward: (id) => set((s) => {
    const idx = s.layers.findIndex((l) => l.id === id);
    if (idx === -1 || idx === s.layers.length - 1) return s;
    const layers = [...s.layers];
    [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
    return { layers };
  }),

  sendBackward: (id) => set((s) => {
    const idx = s.layers.findIndex((l) => l.id === id);
    if (idx <= 0) return s;
    const layers = [...s.layers];
    [layers[idx - 1], layers[idx]] = [layers[idx], layers[idx - 1]];
    return { layers };
  }),

  undo: () => set((s) => {
    if (!s._past.length) return s;
    const past = [...s._past];
    const layers = past.pop()!;
    const _future = [snapshot(s), ...s._future].slice(0, MAX_HISTORY);
    return { layers, _past: past, _future };
  }),

  redo: () => set((s) => {
    if (!s._future.length) return s;
    const future = [...s._future];
    const layers = future.shift()!;
    const _past = [...s._past, snapshot(s)].slice(-MAX_HISTORY);
    return { layers, _past, _future: future };
  }),

  canUndo: () => get()._past.length > 0,
  canRedo: () => get()._future.length > 0,

  setTextureSettings: (patch) => set((s) => ({ textureSettings: { ...s.textureSettings, ...patch } })),
  setInteracting: (interacting) => set({ isInteracting: interacting }),

  getLayer: (id) => get().layers.find((l) => l.id === id),
  getLayersForZone: (zone) => get().layers.filter((l) => l.zone === zone && l.visible),
}));
