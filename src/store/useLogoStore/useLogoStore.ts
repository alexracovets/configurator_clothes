'use client';

import { useMemo } from 'react';

import { create } from 'zustand';

import type { LogoInstance, LogoPosition } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

const USER_POSITIONS = shirtConfig.logoPositions.filter((p) => !p.default);

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `logo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

const createDefaultInstance = (position: LogoPosition): LogoInstance => {
  const pos = shirtConfig.logoPositions.find((p) => p.position === position);
  return {
    id: `default-${position}`,
    position,
    src: pos?.defaultSrc ?? '',
    scale: 1,
    rotation: 0,
    isDefault: true,
    visible: true,
  };
};

const createUserInstance = (position: LogoPosition, src: string): LogoInstance => ({
  id: newId(),
  position,
  src,
  scale: 1,
  rotation: 0,
  isDefault: false,
  visible: true,
});

interface LogoStore {
  instances: LogoInstance[];
  activeId: string | null;

  addUserLogo: (src: string) => boolean;
  removeInstance: (id: string) => void;
  updateInstance: (id: string, patch: Partial<Omit<LogoInstance, 'id' | 'position' | 'isDefault'>>) => void;
  setActiveId: (id: string) => void;
  getActive: () => LogoInstance | undefined;
  getUserInstances: () => LogoInstance[];
  canAddUserLogo: () => boolean;
}

const defaultInstances = shirtConfig.logoPositions.filter((p) => p.default).map((p) => createDefaultInstance(p.position));

const useLogoStore = create<LogoStore>((set, get) => ({
  instances: defaultInstances,
  activeId: null,

  getActive: () => {
    const { instances, activeId } = get();
    return instances.find(({ id }) => id === activeId);
  },

  getUserInstances: () => get().instances.filter((i) => !i.isDefault),

  canAddUserLogo: () => {
    const used = new Set(
      get()
        .instances.filter((i) => !i.isDefault)
        .map((i) => i.position),
    );
    return USER_POSITIONS.some((p) => !used.has(p.position));
  },

  setActiveId: (id) => set({ activeId: id }),

  addUserLogo: (src) => {
    const used = new Set(
      get()
        .instances.filter((i) => !i.isDefault)
        .map((i) => i.position),
    );
    const free = USER_POSITIONS.find((p) => !used.has(p.position));
    if (!free) return false;
    const inst = createUserInstance(free.position, src);
    set(({ instances }) => ({ instances: [...instances, inst], activeId: inst.id }));
    return true;
  },

  removeInstance: (id) =>
    set(({ instances: prev, activeId: prevActive }) => {
      const target = prev.find((i) => i.id === id);
      if (!target || target.isDefault) return { instances: prev, activeId: prevActive };
      const instances = prev.filter((i) => i.id !== id);
      const activeId = prevActive === id ? (instances.find((i) => !i.isDefault)?.id ?? null) : prevActive;
      return { instances, activeId };
    }),

  updateInstance: (id, patch) =>
    set(({ instances }) => ({
      instances: instances.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),
}));

const useActiveLogoInstance = () => useLogoStore(({ instances, activeId }) => instances.find(({ id }) => id === activeId));

const useUserLogoInstances = () => {
  const instances = useLogoStore(({ instances }) => instances);
  return useMemo(() => instances.filter((i) => !i.isDefault), [instances]);
};

export { useActiveLogoInstance, useLogoStore, useUserLogoInstances };
