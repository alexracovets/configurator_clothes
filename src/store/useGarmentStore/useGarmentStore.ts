import { create } from 'zustand';

import type { PrintZoneKey } from '@types';

import { type GarmentConfig, type GarmentType, getGarmentConfig, getGarmentsForStyle, type StyleId } from '@data';

import { useConfiguratorStore } from '../configuratorDesign/configuratorDesign.store';
import { useSelectionStore } from '../useSelectionStore';

const STYLE_ID: StyleId = 'crewneck';

const DEFAULT_PART: Record<GarmentType, string> = {
  shirt: 'front',
  shorts: 'left',
};

interface GarmentStore {
  styleId: StyleId;
  activeGarment: GarmentType;
  availableGarments: GarmentType[];
  setActiveGarment: (garment: GarmentType) => void;
  getActiveGarmentConfig: () => GarmentConfig;
}

const availableGarments = getGarmentsForStyle(STYLE_ID);

const useGarmentStore = create<GarmentStore>((set, get) => ({
  styleId: STYLE_ID,
  activeGarment: 'shirt',
  availableGarments,

  setActiveGarment: (garment) => {
    if (!availableGarments.includes(garment)) return;

    set({ activeGarment: garment });

    const defaultPart = DEFAULT_PART[garment];
    useSelectionStore.getState().selectOnlyPartForGarment(garment, defaultPart);

    useConfiguratorStore.setState({
      activeZone: defaultPart as PrintZoneKey,
      layers: [],
      selectedId: null,
      _past: [],
      _future: [],
    });
  },

  getActiveGarmentConfig: () => getGarmentConfig(get().styleId, get().activeGarment),
}));

export { useGarmentStore };
