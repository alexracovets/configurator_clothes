import { create } from "zustand";

import type { ShirtPart, PartColors } from "../types";
import { useSelectionStore } from "../useSelectionStore";

const DEFAULT_COLOR = "#ffffff";

interface ColorStore {
  partColors: PartColors;
  setColorForSelected: (color: string) => void;
  setPartColor: (part: ShirtPart, color: string) => void;
}

const useColorStore = create<ColorStore>((set) => ({
  partColors: {
    front: DEFAULT_COLOR,
    back: DEFAULT_COLOR,
    sleeve_left: DEFAULT_COLOR,
    sleeve_right: DEFAULT_COLOR,
  },

  setColorForSelected: (color) =>
    set(({ partColors }) => {
      const { selectedParts } = useSelectionStore.getState();
      const updates: Partial<PartColors> = {};
      selectedParts.forEach((part) => { updates[part] = color; });
      return { partColors: { ...partColors, ...updates } };
    }),

  setPartColor: (part, color) =>
    set(({ partColors }) => ({ partColors: { ...partColors, [part]: color } })),
}));

export { useColorStore };
