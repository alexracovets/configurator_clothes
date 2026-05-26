import { create } from "zustand";
import { PRINT_ZONES, type PrintZoneKey, TEXTURE_SIZE_EDITOR } from "../texture/textureConstants";

// ─── Font registry (same as old decal system) ────────────────────────────────
export const FONTS = [
  { label: "Serie EA",      value: "--font-oswald",        canvasFont: "Oswald" },
  { label: "Bebas Neue",    value: "--font-bebas-neue",    canvasFont: "Bebas Neue" },
  { label: "Anton",         value: "--font-anton",         canvasFont: "Anton" },
  { label: "Russo One",     value: "--font-russo-one",     canvasFont: "Russo One" },
  { label: "Black Ops One", value: "--font-black-ops-one", canvasFont: "Black Ops One" },
] as const;

export type FontValue = (typeof FONTS)[number]["value"];

export const CSS_VAR_TO_CANVAS_FONT: Record<string, string> = Object.fromEntries(
  FONTS.map((f) => [f.value, f.canvasFont]),
);

export function resolveCanvasFont(cssVar: string): string {
  return CSS_VAR_TO_CANVAS_FONT[cssVar] ?? cssVar;
}

// ─── Layer types ─────────────────────────────────────────────────────────────
export type LayerType = "text" | "number" | "logo";

/**
 * All position/size values are in normalised UV space [0, 1].
 * x / y  → centre of the element within the texture.
 * scaleX / scaleY → size relative to texture (1.0 = full texture width/height).
 */
export interface DesignLayer {
  id: string;
  type: LayerType;
  zone: PrintZoneKey;
  /** UV centre X (0-1) within full texture */
  x: number;
  /** UV centre Y (0-1) within full texture */
  y: number;
  rotation: number; // degrees
  scaleX: number;   // 0-1 relative to texture width
  scaleY: number;   // 0-1 relative to texture height
  visible: boolean;
  locked: boolean;
  // text / number specific
  text?: string;
  font?: string;       // CSS var key, e.g. "--font-oswald"
  fontSize?: number;   // px at TEXTURE_SIZE_EDITOR resolution
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // logo specific
  src?: string;        // data-URL or URL
}

// ─── Texture settings ─────────────────────────────────────────────────────────
export interface TextureSettings {
  resolution: number;
  transparentBackground: boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────
const MAX_HISTORY = 50;

interface ConfiguratorState {
  layers: DesignLayer[];
  selectedId: string | null;
  activeZone: PrintZoneKey;
  textureSettings: TextureSettings;
  // undo / redo stacks (each entry is a full layers snapshot)
  _past:   DesignLayer[][];
  _future: DesignLayer[][];
}

interface ConfiguratorActions {
  // layer CRUD
  addLayer: (layer: Omit<DesignLayer, "id">) => string;
  updateLayer: (id: string, patch: Partial<Omit<DesignLayer, "id">>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  // selection
  selectLayer: (id: string | null) => void;
  // zone
  setActiveZone: (zone: PrintZoneKey) => void;
  // visibility / lock
  toggleVisible: (id: string) => void;
  toggleLocked: (id: string) => void;
  // layer order
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  // history
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  // texture settings
  setTextureSettings: (patch: Partial<TextureSettings>) => void;
  // helpers
  getLayer: (id: string) => DesignLayer | undefined;
  getLayersForZone: (zone: PrintZoneKey) => DesignLayer[];
}

type ConfiguratorStore = ConfiguratorState & ConfiguratorActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Store creation ───────────────────────────────────────────────────────────
export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  layers: [],
  selectedId: null,
  activeZone: "front",
  textureSettings: {
    resolution: TEXTURE_SIZE_EDITOR,
    transparentBackground: true,
  },
  _past: [],
  _future: [],

  // ── layer CRUD ──────────────────────────────────────────────────────────────
  addLayer: (layer) => {
    const id = newId();
    const centre = zoneCentre(layer.zone);
    const full: DesignLayer = Object.assign(
      {
        x: centre.x,
        y: centre.y,
        scaleX: 0.2,
        scaleY: 0.1,
        rotation: 0,
        visible: true,
        locked: false,
      },
      layer,
      { id },
    );
    set((s) => ({
      ...pushHistory(s),
      layers: [...s.layers, full],
      selectedId: id,
    }));
    return id;
  },

  updateLayer: (id, patch) => {
    set((s) => ({
      ...pushHistory(s),
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  },

  removeLayer: (id) => {
    set((s) => ({
      ...pushHistory(s),
      layers: s.layers.filter((l) => l.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  duplicateLayer: (id) => {
    const source = get().layers.find((l) => l.id === id);
    if (!source) return;
    const newLayer: DesignLayer = {
      ...source,
      id: newId(),
      x: Math.min(1, source.x + 0.03),
      y: Math.min(1, source.y + 0.03),
    };
    set((s) => ({
      ...pushHistory(s),
      layers: [...s.layers, newLayer],
      selectedId: newLayer.id,
    }));
  },

  // ── selection ───────────────────────────────────────────────────────────────
  selectLayer: (id) => set({ selectedId: id }),

  // ── zone ────────────────────────────────────────────────────────────────────
  setActiveZone: (zone) => set({ activeZone: zone }),

  // ── visibility / lock ───────────────────────────────────────────────────────
  toggleVisible: (id) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),

  toggleLocked: (id) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    })),

  // ── layer order ─────────────────────────────────────────────────────────────
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

  // ── history ─────────────────────────────────────────────────────────────────
  undo: () =>
    set((s) => {
      if (!s._past.length) return s;
      const past    = [...s._past];
      const layers  = past.pop()!;
      const _future = [snapshot(s), ...s._future].slice(0, MAX_HISTORY);
      return { layers, _past: past, _future };
    }),

  redo: () =>
    set((s) => {
      if (!s._future.length) return s;
      const future  = [...s._future];
      const layers  = future.shift()!;
      const _past   = [...s._past, snapshot(s)].slice(-MAX_HISTORY);
      return { layers, _past, _future: future };
    }),

  canUndo: () => get()._past.length > 0,
  canRedo: () => get()._future.length > 0,

  // ── texture settings ────────────────────────────────────────────────────────
  setTextureSettings: (patch) =>
    set((s) => ({ textureSettings: { ...s.textureSettings, ...patch } })),

  // ── helpers ─────────────────────────────────────────────────────────────────
  getLayer: (id) => get().layers.find((l) => l.id === id),

  getLayersForZone: (zone) => get().layers.filter((l) => l.zone === zone && l.visible),
}));
