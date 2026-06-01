import { create } from 'zustand';

import { type GarmentType, getGarmentsForStyle, type StyleId } from '@data';

import { useGarmentStore } from '../useGarmentStore';

const STYLE_ID: StyleId = 'crewneck';

interface PatternState {
  patternUrl: string | null;
  patternOpacity: number;
  patternColor: string;
}

const createDefaultPatternState = (): PatternState => ({
  patternUrl: null,
  patternOpacity: 0.8,
  patternColor: '#000000',
});

const garments = getGarmentsForStyle(STYLE_ID);
const defaultPatternByGarment = Object.fromEntries(garments.map((g) => [g, createDefaultPatternState()])) as Record<GarmentType, PatternState>;

interface PatternStore {
  patternByGarment: Record<GarmentType, PatternState>;
  setPattern: (url: string | null) => void;
  setPatternOpacity: (value: number) => void;
  setPatternColor: (color: string) => void;
}

const usePatternStore = create<PatternStore>((set) => ({
  patternByGarment: { ...defaultPatternByGarment },

  setPattern: (url) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    set(({ patternByGarment }) => ({
      patternByGarment: {
        ...patternByGarment,
        [activeGarment]: { ...patternByGarment[activeGarment], patternUrl: url },
      },
    }));
  },

  setPatternOpacity: (value) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    set(({ patternByGarment }) => ({
      patternByGarment: {
        ...patternByGarment,
        [activeGarment]: { ...patternByGarment[activeGarment], patternOpacity: value },
      },
    }));
  },

  setPatternColor: (color) => {
    const activeGarment = useGarmentStore.getState().activeGarment;
    set(({ patternByGarment }) => ({
      patternByGarment: {
        ...patternByGarment,
        [activeGarment]: { ...patternByGarment[activeGarment], patternColor: color },
      },
    }));
  },
}));

const useActivePatternState = (): PatternState => {
  const activeGarment = useGarmentStore((s) => s.activeGarment);
  return usePatternStore((s) => s.patternByGarment[activeGarment]);
};

export { useActivePatternState, usePatternStore };
