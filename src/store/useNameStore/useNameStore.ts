import { create } from 'zustand';

import { DEFAULT_NAME_TEXT, FONTS } from '@constants';
import type { NameInstance, NamePosition } from '@types';

const POSITIONS: { value: NamePosition; label: string }[] = [
  { value: 'top', label: 'Top Back' },
  { value: 'bottom', label: 'Bottom Back' },
];

const createDefaultInstance = (id: string, position: NamePosition): NameInstance => ({
  id,
  position,
  text: DEFAULT_NAME_TEXT,
  font: FONTS[0].value,
  fontSize: 64,
  textColor: '#FFFFFF',
  strokeColor: '#1A2744',
  strokeWidth: 4,
});

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `name-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

interface NameStore {
  isVisible: boolean;
  instances: NameInstance[];
  activeId: string | null;
  pendingPosition: boolean;

  setPendingPosition: (pending: boolean) => void;
  addInstance: (position: NamePosition) => void;
  setVisible: (visible: boolean) => void;
  setActiveId: (id: string) => void;
  updateInstance: (id: string, patch: Partial<Omit<NameInstance, 'id'>>) => void;
  updateActive: (patch: Partial<Omit<NameInstance, 'id'>>) => void;
  duplicateInstance: (id: string) => void;
  removeInstance: (id: string) => void;
  getActive: () => NameInstance | undefined;
}

const useNameStore = create<NameStore>((set, get) => ({
  isVisible: false,
  instances: [],
  activeId: null,
  pendingPosition: false,

  getActive: () => {
    const { instances, activeId } = get();
    return instances.find(({ id }) => id === activeId);
  },

  setPendingPosition: (pending) => set({ pendingPosition: pending }),

  addInstance: (position) => {
    const { instances } = get();
    if (instances.some((i) => i.position === position)) return;
    const id = newId();
    set({ isVisible: true, instances: [...instances, createDefaultInstance(id, position)], activeId: id, pendingPosition: false });
  },

  setVisible: (visible) => {
    if (!visible) {
      set({ isVisible: false, instances: [], activeId: null, pendingPosition: false });
      return;
    }
    set({ isVisible: true });
  },

  setActiveId: (id) => set({ activeId: id }),

  updateInstance: (id, patch) =>
    set(({ instances }) => ({
      instances: instances.map((inst) => (inst.id === id ? { ...inst, ...patch } : inst)),
    })),

  updateActive: (patch) => {
    const { activeId } = get();
    if (!activeId) return;
    get().updateInstance(activeId, patch);
  },

  duplicateInstance: (id) => {
    const source = get().instances.find((inst) => inst.id === id);
    if (!source) return;
    const newInstanceId = newId();
    set(({ instances }) => ({ instances: [...instances, { ...source, id: newInstanceId }], activeId: newInstanceId }));
  },

  removeInstance: (id) =>
    set(({ instances: prev, activeId: prevActiveId }) => {
      const instances = prev.filter((inst) => inst.id !== id);
      const activeId = prevActiveId === id ? (instances[instances.length - 1]?.id ?? null) : prevActiveId;
      return { instances, activeId, isVisible: instances.length > 0 };
    }),
}));

const useActiveNameInstance = () => useNameStore(({ instances, activeId }) => instances.find(({ id }) => id === activeId));

export { POSITIONS, useActiveNameInstance, useNameStore };
