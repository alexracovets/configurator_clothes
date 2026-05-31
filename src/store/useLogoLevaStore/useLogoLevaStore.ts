import { create } from 'zustand';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

type LevaLogoValues = Record<string, number>;

const buildDefaults = (): LevaLogoValues => {
  const out: LevaLogoValues = {};
  for (const p of shirtConfig.logoPositions) {
    out[`${p.position}_x`] = p.uv.x;
    out[`${p.position}_y`] = p.uv.y;
    out[`${p.position}_scaleX`] = p.scaleX;
    out[`${p.position}_rotation`] = p.rotation;
  }
  return out;
};

interface LevaLogoStore {
  values: LevaLogoValues;
  set: (patch: Partial<LevaLogoValues>) => void;
}

const useLogoLevaStore = create<LevaLogoStore>((set) => ({
  values: buildDefaults(),
  set: (patch) => set(({ values }) => ({ values: { ...values, ...patch } })),
}));

export { useLogoLevaStore };
