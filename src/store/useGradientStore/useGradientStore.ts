import { create } from "zustand";

import { useSelectionStore } from "../useSelectionStore";
import type { ShirtPart } from "../types";

export interface PartGradient {
  enabled: boolean;
  color2: string;
  rotation: number;
  position: number;
  softness: number;
  opacity: number;
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
  },

  setGradientForSelected: (gradient) =>
    set(({ partGradients }) => {
      const { selectedParts } = useSelectionStore.getState();
      const next = { ...partGradients };
      selectedParts.forEach((part) => { next[part] = { ...next[part], ...gradient }; });
      return { partGradients: next };
    }),

  setPartGradient: (part, gradient) =>
    set(({ partGradients }) => ({ partGradients: { ...partGradients, [part]: { ...partGradients[part], ...gradient } } })),
}));
