import { create } from "zustand";

import {
  FONTS,
  fontCssFamily,
  fontCanvasName,
  DECAL_DEPTH,
  clampDecalScale,
  fontSizeToDecalScale,
  decalWidthToFontSize,
} from "../decal";

export { FONTS, fontCssFamily, fontCanvasName, fontSizeToDecalScale, decalWidthToFontSize };

export const DEFAULT_NAME_TEXT = "PLAYER NAME";

export const NAME_DECAL_DEPTH = DECAL_DEPTH;

export interface NameInstance {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  decalPosition: [number, number, number];
  decalRotation: [number, number, number];
  decalScale: [number, number, number];
}

const createDefaultInstance = (id: string): NameInstance => ({
  id,
  text: DEFAULT_NAME_TEXT,
  font: FONTS[0].value,
  fontSize: 64,
  textColor: "#FFFFFF",
  strokeColor: "#1A2744",
  strokeWidth: 4,
  decalPosition: [0, 1.37, -0.063],
  decalRotation: [Math.PI, 0, Math.PI],
  decalScale: fontSizeToDecalScale(64),
});

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `name-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface NameStore {
  isVisible: boolean;
  instances: NameInstance[];
  activeId: string | null;

  setVisible: (visible: boolean) => void;
  setActiveId: (id: string) => void;
  updateInstance: (id: string, patch: Partial<Omit<NameInstance, "id">>) => void;
  updateActive: (patch: Partial<Omit<NameInstance, "id">>) => void;
  duplicateInstance: (id: string) => void;
  removeInstance: (id: string) => void;

  getActive: () => NameInstance | undefined;
}

export const useNameStore = create<NameStore>((set, get) => ({
  isVisible: false,
  instances: [],
  activeId: null,

  getActive: () => {
    const { instances, activeId } = get();
    return instances.find(({ id }) => id === activeId);
  },

  setVisible: (visible) => {
    if (!visible) {
      set({ isVisible: false, instances: [], activeId: null });
      return;
    }

    const { instances } = get();

    if (instances.length > 0) {
      set({ isVisible: true });
      return;
    }

    const id = newId();
    set({ isVisible: true, instances: [createDefaultInstance(id)], activeId: id });
  },

  setActiveId: (id) => set({ activeId: id }),

  updateInstance: (id, patch) =>
    set(({ instances }) => ({
      instances: instances.map((inst) => {
        if (inst.id !== id) return inst;

        const next = { ...inst, ...patch };

        if (patch.fontSize !== undefined) {
          next.decalScale = fontSizeToDecalScale(patch.fontSize);
        } else if (patch.decalScale !== undefined) {
          next.decalScale = clampDecalScale(patch.decalScale[0]);
          next.fontSize = decalWidthToFontSize(next.decalScale[0]);
        }

        return next;
      }),
    })),

  updateActive: (patch) => {
    const { activeId } = get();
    if (!activeId) return;
    get().updateInstance(activeId, patch);
  },

  duplicateInstance: (id) => {
    const source = get().instances.find((inst) => inst.id === id);
    if (!source) return;

    const newInstId = newId();
    const copy: NameInstance = {
      ...source,
      id: newInstId,
      decalPosition: [
        source.decalPosition[0] + 0.12,
        source.decalPosition[1] - 0.06,
        source.decalPosition[2],
      ],
    };

    set(({ instances }) => ({ instances: [...instances, copy], activeId: newInstId }));
  },

  removeInstance: (id) =>
    set(({ instances: prev, activeId: prevActiveId }) => {
      const instances = prev.filter((inst) => inst.id !== id);
      const activeId =
        prevActiveId === id ? (instances[instances.length - 1]?.id ?? null) : prevActiveId;

      return { instances, activeId, isVisible: instances.length > 0 };
    }),
}));

export const useActiveNameInstance = () =>
  useNameStore(({ instances, activeId }) => instances.find(({ id }) => id === activeId));
