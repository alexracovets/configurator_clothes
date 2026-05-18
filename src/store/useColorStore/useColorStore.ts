import { create } from "zustand";

import type { ShirtPart, PartColors } from "../types";
import { useSelectionStore } from "../useSelectionStore";

const DEFAULT_COLOR = "#898989";

interface ColorStore {
  partColors: PartColors;
  setColorForSelected: (color: string) => void;
  setPartColor: (part: ShirtPart, color: string) => void;
}

export const useColorStore = create<ColorStore>((set) => ({
  partColors: {
    front: DEFAULT_COLOR,
    back: DEFAULT_COLOR,
    sleeve_left: DEFAULT_COLOR,
    sleeve_right: DEFAULT_COLOR,
    collar: DEFAULT_COLOR,
  },

  setColorForSelected: (color) =>
    set((state) => {
      const { selectedParts } = useSelectionStore.getState();
      const updates: Partial<PartColors> = {};
      selectedParts.forEach((p) => {
        updates[p] = color;
      });
      return { partColors: { ...state.partColors, ...updates } };
    }),

  setPartColor: (part, color) =>
    set((state) => ({
      partColors: { ...state.partColors, [part]: color },
    })),
}));
