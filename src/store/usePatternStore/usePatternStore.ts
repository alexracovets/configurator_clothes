import { create } from 'zustand';

import type { PatternItem, ShirtPart } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

const SHIRT_PARTS: { key: ShirtPart; label: string; name: string }[] = shirtConfig.parts.map(({ key, label, name }) => ({
  key: key as ShirtPart,
  label,
  name,
}));

const PATTERNS: PatternItem[] = shirtConfig.patterns.map(({ id, label, url }) => ({ id, label, url }));

interface PatternStore {
  patternUrl: string | null;
  patternOpacity: number;
  patternColor: string;
  setPattern: (url: string | null) => void;
  setPatternOpacity: (value: number) => void;
  setPatternColor: (color: string) => void;
}

const usePatternStore = create<PatternStore>((set) => ({
  patternUrl: null,
  patternOpacity: 0.8,
  patternColor: '#000000',

  setPattern: (url) => set({ patternUrl: url }),
  setPatternOpacity: (value) => set({ patternOpacity: value }),
  setPatternColor: (color) => set({ patternColor: color }),
}));

export { PATTERNS, SHIRT_PARTS, usePatternStore };
