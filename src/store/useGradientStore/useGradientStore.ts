import { create } from 'zustand';

import { useSelectionStore } from '@store';
import type { PartGradient, PartGradients, ShirtPart } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

const DEFAULT_GRADIENT: PartGradient = {
  enabled: false,
  color2: '#111111',
  rotation: 0,
  position: 100,
  softness: 100,
  opacity: 100,
};

const defaultPartGradients = Object.fromEntries(shirtConfig.parts.map(({ key }) => [key, { ...DEFAULT_GRADIENT }])) as PartGradients;

interface GradientStore {
  partGradients: PartGradients;
  setGradientForSelected: (gradient: Partial<PartGradient>) => void;
  setPartGradient: (part: ShirtPart, gradient: Partial<PartGradient>) => void;
}

const useGradientStore = create<GradientStore>((set) => ({
  partGradients: { ...defaultPartGradients },

  setGradientForSelected: (gradient) => {
    const { selectedParts } = useSelectionStore.getState();
    set(({ partGradients }) => {
      const next = { ...partGradients };
      selectedParts.forEach((part) => {
        next[part] = { ...next[part], ...gradient };
      });
      return { partGradients: next };
    });
  },

  setPartGradient: (part, gradient) => set(({ partGradients }) => ({ partGradients: { ...partGradients, [part]: { ...partGradients[part], ...gradient } } })),
}));

export { useGradientStore };
