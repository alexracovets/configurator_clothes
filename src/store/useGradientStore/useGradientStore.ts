import { create } from 'zustand';

import type { PartGradient, PartGradients } from '@types';

import { type GarmentType, getGarmentConfig, getGarmentsForStyle, type StyleId } from '@data';

import { useGarmentStore } from '../useGarmentStore';
import { useSelectionStore } from '../useSelectionStore';

const STYLE_ID: StyleId = 'crewneck';

const DEFAULT_GRADIENT: PartGradient = {
  enabled: false,
  color2: '#111111',
  rotation: 0,
  position: 100,
  softness: 100,
  opacity: 100,
};

const createDefaultPartGradients = (garment: GarmentType): PartGradients => {
  const parts = getGarmentConfig(STYLE_ID, garment).parts;
  return Object.fromEntries(parts.map(({ key }) => [key, { ...DEFAULT_GRADIENT }]));
};

const garments = getGarmentsForStyle(STYLE_ID);
const defaultGradientsByGarment = Object.fromEntries(garments.map((g) => [g, createDefaultPartGradients(g)])) as Record<GarmentType, PartGradients>;

interface GradientStore {
  gradientsByGarment: Record<GarmentType, PartGradients>;
  setGradientForSelected: (gradient: Partial<PartGradient>) => void;
  setPartGradient: (part: string, gradient: Partial<PartGradient>) => void;
}

const useGradientStore = create<GradientStore>((set) => ({
  gradientsByGarment: { ...defaultGradientsByGarment },

  setGradientForSelected: (gradient) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    const { selectedByGarment } = useSelectionStore.getState();
    const selectedParts = selectedByGarment[activeGarment];
    set(({ gradientsByGarment }) => {
      const partGradients = { ...gradientsByGarment[activeGarment] };
      selectedParts.forEach((part) => {
        partGradients[part] = { ...partGradients[part], ...gradient };
      });
      return { gradientsByGarment: { ...gradientsByGarment, [activeGarment]: partGradients } };
    });
  },

  setPartGradient: (part, gradient) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    set(({ gradientsByGarment }) => ({
      gradientsByGarment: {
        ...gradientsByGarment,
        [activeGarment]: {
          ...gradientsByGarment[activeGarment],
          [part]: { ...gradientsByGarment[activeGarment][part], ...gradient },
        },
      },
    }));
  },
}));

const useActivePartGradients = (): PartGradients => {
  const activeGarment = useGarmentStore((s) => s.activeGarment);
  return useGradientStore((s) => s.gradientsByGarment[activeGarment]);
};

export { useActivePartGradients, useGradientStore };
