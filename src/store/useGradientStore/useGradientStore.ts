import { create } from "zustand";

import type { ShirtPart } from "../types";
import { useSelectionStore } from "../useSelectionStore";

export interface PartGradient {
  enabled: boolean;
  color2: string;
  rotation: number;   // 0-360 degrees
  position: number;   // 0-100 midpoint of transition
  softness: number;   // 0-100 width of blend zone
  opacity: number;    // 0-100
}

export type PartGradients = Record<ShirtPart, PartGradient>;

const DEFAULT_GRADIENT: PartGradient = {
  enabled: false,
  color2: "#111111",
  rotation: 180,
  position: 50,
  softness: 20,
  opacity: 100,
};

interface GradientStore {
  partGradients: PartGradients;
  setGradientForSelected: (gradient: Partial<PartGradient>) => void;
  setPartGradient: (part: ShirtPart, gradient: Partial<PartGradient>) => void;
}

export const useGradientStore = create<GradientStore>((set) => ({
  partGradients: {
    front: { ...DEFAULT_GRADIENT },
    back: { ...DEFAULT_GRADIENT },
    sleeve_left: { ...DEFAULT_GRADIENT },
    sleeve_right: { ...DEFAULT_GRADIENT },
    collar: { ...DEFAULT_GRADIENT },
  },

  setGradientForSelected: (gradient) =>
    set((state) => {
      const { selectedParts } = useSelectionStore.getState();
      const next = { ...state.partGradients };
      selectedParts.forEach((p) => {
        next[p] = { ...next[p], ...gradient };
      });
      return { partGradients: next };
    }),

  setPartGradient: (part, gradient) =>
    set((state) => ({
      partGradients: {
        ...state.partGradients,
        [part]: { ...state.partGradients[part], ...gradient },
      },
    })),
}));
