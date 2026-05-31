import { create } from 'zustand';

import { DEFAULT_NUMBER_TEXT, FONTS } from '@constants';
import type { NumberInstance, NumberPosition } from '@types';

const createDefaultInstance = (id: string, position: NumberPosition): NumberInstance => ({
  id,
  position,
  text: DEFAULT_NUMBER_TEXT,
  font: FONTS[0].value,
  fontSize: 64,
  textColor: '#FFFFFF',
  strokeColor: '#1A2744',
  strokeWidth: 4,
});

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `number-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface NumberStore {
  instances: NumberInstance[];
  activeId: string | null;

  addInstance: (position: NumberPosition) => void;
  removeInstance: (id: string) => void;
  updateInstance: (id: string, patch: Partial<Omit<NumberInstance, 'id' | 'position'>>) => void;
  updateActive: (patch: Partial<Omit<NumberInstance, 'id' | 'position'>>) => void;
  setActiveId: (id: string) => void;
  getActive: () => NumberInstance | undefined;
}

const useNumberStore = create<NumberStore>((set, get) => ({
  instances: [],
  activeId: null,

  getActive: () => {
    const { instances, activeId } = get();
    return instances.find(({ id }) => id === activeId);
  },

  setActiveId: (id) => set({ activeId: id }),

  addInstance: (position) => {
    if (get().instances.some((i) => i.position === position)) return;
    const id = newId();
    set(({ instances }) => ({ instances: [...instances, createDefaultInstance(id, position)], activeId: id }));
  },

  removeInstance: (id) =>
    set(({ instances: prev, activeId: prevActive }) => {
      const instances = prev.filter((i) => i.id !== id);
      const activeId = prevActive === id ? (instances[instances.length - 1]?.id ?? null) : prevActive;
      return { instances, activeId };
    }),

  updateInstance: (id, patch) =>
    set(({ instances }) => ({
      instances: instances.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),

  updateActive: (patch) => {
    const { activeId } = get();
    if (!activeId) return;
    get().updateInstance(activeId, patch);
  },
}));

const useActiveNumberInstance = () => useNumberStore(({ instances, activeId }) => instances.find(({ id }) => id === activeId));

export { useActiveNumberInstance, useNumberStore };
