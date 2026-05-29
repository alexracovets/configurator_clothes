import { create } from "zustand";

import type { ShirtPart, PartPatterns } from "../types";
import { useSelectionStore } from "../useSelectionStore";

export interface PatternItem {
  id: string;
  label: string;
  url: string;
}

const SHIRT_PARTS: { key: ShirtPart; label: string; italianLabel: string }[] = [
  { key: "front",        label: "Front",       italianLabel: "Davanti"  },
  { key: "back",         label: "Back",        italianLabel: "Retro"    },
  { key: "sleeve_left",  label: "Left sleeve", italianLabel: "Manica 1" },
  { key: "sleeve_right", label: "Right sleeve",italianLabel: "Manica 2" },
];

const PATTERNS: PatternItem[] = [
  {
    id: "design_0",
    label: "Design 0",
    url: "/models/crewneck/designs/design_0.svg",
  },
];

interface PatternStore {
  partPatterns: PartPatterns;
  patternOpacity: number;
  patternColor: string;
  setPatternForSelected: (url: string) => void;
  setPatternForAll: (url: string | null) => void;
  setPatternOpacity: (value: number) => void;
  setPatternColor: (color: string) => void;
}

const usePatternStore = create<PatternStore>((set) => ({
  partPatterns: {
    front: "",
    back: "",
    sleeve_left: "",
    sleeve_right: "",
  },
  patternOpacity: 0.8,
  patternColor: "#000000",

  setPatternForSelected: (url) =>
    set(({ partPatterns }) => {
      const { selectedParts } = useSelectionStore.getState();
      const updates: Partial<PartPatterns> = {};
      selectedParts.forEach((part) => { updates[part] = url; });
      return { partPatterns: { ...partPatterns, ...updates } };
    }),

  setPatternForAll: (url) =>
    set(({ partPatterns }) => ({
      partPatterns: Object.fromEntries(
        Object.keys(partPatterns).map((k) => [k, url]),
      ) as PartPatterns,
    })),

  setPatternOpacity: (value) => set({ patternOpacity: value }),
  setPatternColor: (color) => set({ patternColor: color }),
}));

export { SHIRT_PARTS, PATTERNS, usePatternStore };
