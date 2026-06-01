import { create } from 'zustand';

import { PALETTE_COLORS } from '@constants';
import type { PartColors } from '@types';

import { type GarmentType, getGarmentConfig, getGarmentsForStyle, type StyleId } from '@data';

import { useGarmentStore } from '../useGarmentStore';
import { useSelectionStore } from '../useSelectionStore';

const STYLE_ID: StyleId = 'crewneck';
const defaultColor = PALETTE_COLORS[0];

const createDefaultPartColors = (garment: GarmentType): PartColors => {
  const parts = getGarmentConfig(STYLE_ID, garment).parts;
  return Object.fromEntries(parts.map(({ key }) => [key, defaultColor]));
};

const garments = getGarmentsForStyle(STYLE_ID);
const defaultColorsByGarment = Object.fromEntries(garments.map((g) => [g, createDefaultPartColors(g)])) as Record<GarmentType, PartColors>;

interface ColorStore {
  colorsByGarment: Record<GarmentType, PartColors>;
  setColorForSelected: (color: string) => void;
  setPartColor: (part: string, color: string) => void;
}

const useColorStore = create<ColorStore>((set) => ({
  colorsByGarment: { ...defaultColorsByGarment },

  setColorForSelected: (color) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    const { selectedByGarment } = useSelectionStore.getState();
    const selectedParts = selectedByGarment[activeGarment];
    set(({ colorsByGarment }) => {
      const partColors = { ...colorsByGarment[activeGarment] };
      selectedParts.forEach((part) => {
        partColors[part] = color;
      });
      return { colorsByGarment: { ...colorsByGarment, [activeGarment]: partColors } };
    });
  },

  setPartColor: (part, color) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    set(({ colorsByGarment }) => ({
      colorsByGarment: {
        ...colorsByGarment,
        [activeGarment]: { ...colorsByGarment[activeGarment], [part]: color },
      },
    }));
  },
}));

const useActivePartColors = (): PartColors => {
  const activeGarment = useGarmentStore((s) => s.activeGarment);
  return useColorStore((s) => s.colorsByGarment[activeGarment]);
};

export { useActivePartColors, useColorStore };
