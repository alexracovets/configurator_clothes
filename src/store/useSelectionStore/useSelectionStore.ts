import type { Mesh } from 'three';

import { create } from 'zustand';

import { type GarmentType, getGarmentConfig, getGarmentsForStyle, type StyleId } from '@data';

const STYLE_ID: StyleId = 'crewneck';
const garments = getGarmentsForStyle(STYLE_ID);

const DEFAULT_SELECTED: Record<GarmentType, string> = {
  shirt: 'front',
  shorts: 'left',
};

const createDefaultSelectedByGarment = (): Record<GarmentType, Set<string>> =>
  Object.fromEntries(garments.map((g) => [g, new Set<string>([DEFAULT_SELECTED[g]])])) as Record<GarmentType, Set<string>>;

interface SelectionStore {
  selectedByGarment: Record<GarmentType, Set<string>>;
  hoveredPart: string | null;
  meshRefs: Partial<Record<string, Mesh>>;
  registerMesh: (part: string, mesh: Mesh) => void;
  setHoveredPart: (part: string | null) => void;
  togglePart: (part: string, garment: GarmentType) => void;
  selectOnlyPartForGarment: (garment: GarmentType, part: string) => void;
  clearSelectionForGarment: (garment: GarmentType) => void;
}

const useSelectionStore = create<SelectionStore>((set) => ({
  selectedByGarment: createDefaultSelectedByGarment(),
  hoveredPart: null,
  meshRefs: {},

  registerMesh: (part, mesh) =>
    set(({ meshRefs }) => ({
      meshRefs: { ...meshRefs, [part]: mesh },
    })),

  setHoveredPart: (part) => set({ hoveredPart: part }),

  togglePart: (part, garment) =>
    set(({ selectedByGarment }) => {
      const current = new Set(selectedByGarment[garment]);
      if (current.has(part)) current.delete(part);
      else current.add(part);
      return { selectedByGarment: { ...selectedByGarment, [garment]: current } };
    }),

  selectOnlyPartForGarment: (garment, part) => {
    const garmentParts = getGarmentConfig(STYLE_ID, garment).parts.map((p) => p.key);
    if (!garmentParts.includes(part)) return;
    set(({ selectedByGarment }) => ({
      selectedByGarment: { ...selectedByGarment, [garment]: new Set([part]) },
    }));
  },

  clearSelectionForGarment: (garment) =>
    set(({ selectedByGarment }) => ({
      selectedByGarment: { ...selectedByGarment, [garment]: new Set() },
    })),
}));

export { useSelectionStore };
