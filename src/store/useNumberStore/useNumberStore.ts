import { create } from 'zustand';

import { DEFAULT_NUMBER_TEXT, FONTS } from '@constants';
import type { NumberInstance } from '@types';

const createDefaultInstance = (): NumberInstance => ({
  text: DEFAULT_NUMBER_TEXT,
  font: FONTS[0].value,
  fontSize: 64,
  textColor: '#FFFFFF',
  strokeColor: '#1A2744',
  strokeWidth: 4,
});

interface NumberStore {
  isVisible: boolean;
  instance: NumberInstance | null;
  setVisible: (visible: boolean) => void;
  update: (patch: Partial<NumberInstance>) => void;
}

const useNumberStore = create<NumberStore>((set) => ({
  isVisible: false,
  instance: null,

  setVisible: (visible) => {
    if (!visible) {
      set({ isVisible: false, instance: null });
      return;
    }
    set((s) => ({
      isVisible: true,
      instance: s.instance ?? createDefaultInstance(),
    }));
  },

  update: (patch) =>
    set(({ instance }) => {
      if (!instance) return {};
      return { instance: { ...instance, ...patch } };
    }),
}));

export { useNumberStore };
