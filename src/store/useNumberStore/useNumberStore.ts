import { create } from "zustand";

import type { NumberInstance } from "@types";
import { DEFAULT_NUMBER_TEXT } from "@constants";
import { FONTS, fontCssFamily, fontCanvasName, DECAL_DEPTH, clampDecalScale, fontSizeToDecalScale, decalWidthToFontSize, DECAL_SCALE_MIN, DECAL_SCALE_MAX } from "../decal";

export { FONTS, fontCssFamily, fontCanvasName };



const NUMBER_DECAL_SCALE_MIN = DECAL_SCALE_MIN;
const NUMBER_DECAL_SCALE_MAX = DECAL_SCALE_MAX;
const NUMBER_DECAL_DEPTH = DECAL_DEPTH;


const createDefaultInstance = (): NumberInstance => ({
  text: DEFAULT_NUMBER_TEXT,
  font: FONTS[0].value,
  fontSize: 64,
  textColor: "#FFFFFF",
  strokeColor: "#1A2744",
  strokeWidth: 4,
  decalPosition: [0, 1.1, 0.063],
  decalRotation: [0, 0, 0],
  decalScale: fontSizeToDecalScale(64),
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
      const next = { ...instance, ...patch };
      if (patch.fontSize !== undefined) {
        next.decalScale = fontSizeToDecalScale(patch.fontSize);
      } else if (patch.decalScale !== undefined) {
        next.decalScale = clampDecalScale(patch.decalScale[0]);
        next.fontSize = decalWidthToFontSize(next.decalScale[0]);
      }
      return { instance: next };
    }),
}));

export { DEFAULT_NUMBER_TEXT, NUMBER_DECAL_SCALE_MIN, NUMBER_DECAL_SCALE_MAX, NUMBER_DECAL_DEPTH, useNumberStore };
