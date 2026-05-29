import { create } from "zustand";
import type { Mesh } from "three";

import type { ShirtPart, MeshRefs } from "../types";

interface SelectionStore {
  selectedParts: Set<ShirtPart>;
  hoveredPart: ShirtPart | null;
  meshRefs: MeshRefs;
  registerMesh: (part: ShirtPart, mesh: Mesh) => void;
  setHoveredPart: (part: ShirtPart | null) => void;
  togglePart: (part: ShirtPart) => void;
  selectOnlyPart: (part: ShirtPart) => void;
  clearSelection: () => void;
}

const useSelectionStore = create<SelectionStore>((set) => ({
  selectedParts: new Set<ShirtPart>(["front"]),
  hoveredPart: null,
  meshRefs: {},

  registerMesh: (part, mesh) =>
    set(({ meshRefs }) => ({ meshRefs: { ...meshRefs, [part]: mesh } })),

  setHoveredPart: (part) => set({ hoveredPart: part }),

  togglePart: (part) =>
    set(({ selectedParts }) => {
      const next = new Set(selectedParts);
      if (next.has(part)) {
        if (next.size > 1) next.delete(part);
      } else {
        next.add(part);
      }
      return { selectedParts: next };
    }),

  selectOnlyPart: (part) => set({ selectedParts: new Set<ShirtPart>([part]) }),

  clearSelection: () => set({ selectedParts: new Set<ShirtPart>() }),
}));

export { useSelectionStore };
