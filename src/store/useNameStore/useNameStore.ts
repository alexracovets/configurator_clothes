import { create } from "zustand";

export const FONTS = [
  { label: "F1", value: "Arial" },
  { label: "F2", value: "Georgia" },
  { label: "F3", value: "Impact" },
  { label: "F4", value: "Courier New" },
  { label: "F5", value: "Trebuchet MS" },
];

export const DEFAULT_NAME_TEXT = "PLAYER NAME";

export const NAME_DECAL_SCALE_MIN = 0.1;
export const NAME_DECAL_SCALE_MAX = 0.8;
export const NAME_DECAL_ASPECT = 1024 / 256;
export const NAME_DECAL_DEPTH = 0.3;

const REF_NAME_FONT_SIZE = 64;
const REF_NAME_DECAL_WIDTH = 1;
const FONT_SIZE_MIN = 24;
const FONT_SIZE_MAX = 120;

export const clampNameDecalScale = (width: number): [number, number, number] => {
  const w = Math.min(NAME_DECAL_SCALE_MAX, Math.max(NAME_DECAL_SCALE_MIN, width));
  return [w, w / NAME_DECAL_ASPECT, NAME_DECAL_DEPTH];
};

export const fontSizeToDecalScale = (fontSize: number): [number, number, number] =>
  clampNameDecalScale(REF_NAME_DECAL_WIDTH * (fontSize / REF_NAME_FONT_SIZE));

export const decalWidthToFontSize = (width: number): number =>
  Math.round(
    Math.min(
      FONT_SIZE_MAX,
      Math.max(FONT_SIZE_MIN, REF_NAME_FONT_SIZE * (width / REF_NAME_DECAL_WIDTH)),
    ),
  );

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
          next.decalScale = clampNameDecalScale(patch.decalScale[0]);
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
