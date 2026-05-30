import { create } from 'zustand';

import { useSelectionStore } from '@store';
import type { PartGradient, PartGradients, ShirtPart } from '@types';

const DEFAULT_GRADIENT: PartGradient = {
  enabled: false,
  color2: '#111111',
  rotation: 0,
  position: 100,
  softness: 100,
  opacity: 100,
};

interface GradientStore {
  partGradients: PartGradients;
  setGradientForSelected: (gradient: Partial<PartGradient>) => void;
  setPartGradient: (part: ShirtPart, gradient: Partial<PartGradient>) => void;
}

const useGradientStore = create<GradientStore>((set) => ({
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
      selectedParts.forEach((part) => {
        next[part] = { ...next[part], ...gradient };
      });
      return { partGradients: next };
    }),

  setPartGradient: (part, gradient) => set(({ partGradients }) => ({ partGradients: { ...partGradients, [part]: { ...partGradients[part], ...gradient } } })),
}));

export { useGradientStore };
