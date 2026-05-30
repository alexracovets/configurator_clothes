import { create } from 'zustand';

import { useSelectionStore } from '@store';
import { PALETTE_COLORS } from '@constants';
import type { PartColors, ShirtPart } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;
const defaultColor = PALETTE_COLORS[0];

const defaultPartColors = Object.fromEntries(shirtConfig.parts.map(({ key }) => [key, defaultColor])) as PartColors;

interface ColorStore {
  partColors: PartColors;
  setColorForSelected: (color: string) => void;
  setPartColor: (part: ShirtPart, color: string) => void;
}

const useColorStore = create<ColorStore>((set) => ({
  partColors: { ...defaultPartColors },

  setColorForSelected: (color) => {
    const { selectedParts } = useSelectionStore.getState();
    const updates: Partial<PartColors> = {};
    selectedParts.forEach((part) => {
      updates[part] = color;
    });
    set(({ partColors }) => ({ partColors: { ...partColors, ...updates } }));
  },

  setPartColor: (part, color) => set(({ partColors }) => ({ partColors: { ...partColors, [part]: color } })),
}));

export { useColorStore };
