import { create } from "zustand";

export const FONTS = [
  { label: "F1", value: "Arial" },
  { label: "F2", value: "Georgia" },
  { label: "F3", value: "Impact" },
  { label: "F4", value: "Courier New" },
  { label: "F5", value: "Trebuchet MS" },
];

export const DEFAULT_NAME_TEXT = "PLAYER NAME";

interface NameStore {
  isVisible: boolean;
  isSelected: boolean;
  text: string;
  font: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  // Decal transform (in 3D space on back mesh)
  decalPosition: [number, number, number];
  decalRotation: [number, number, number];
  decalScale: [number, number, number];

  setVisible: (visible: boolean) => void;
  setSelected: (selected: boolean) => void;
  setText: (text: string) => void;
  setFont: (font: string) => void;
  setFontSize: (size: number) => void;
  setTextColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setDecalPosition: (pos: [number, number, number]) => void;
  setDecalRotation: (rot: [number, number, number]) => void;
  setDecalScale: (scale: [number, number, number]) => void;
}

export const useNameStore = create<NameStore>((set) => ({
  isVisible: false,
  isSelected: false,
  text: DEFAULT_NAME_TEXT,
  font: FONTS[0].value,
  fontSize: 64,
  textColor: "#FFFFFF",
  strokeColor: "#1A2744",
  strokeWidth: 4,
  decalPosition: [0, 1.37, -0.063],
  decalRotation: [Math.PI, 0, Math.PI],
  decalScale: [0.3, 0.08, 0.3],

  setVisible: (visible) => set({ isVisible: visible, isSelected: false }),
  setSelected: (selected) => set({ isSelected: selected }),
  setText: (text) => set({ text }),
  setFont: (font) => set({ font }),
  setFontSize: (size) => set({ fontSize: size }),
  setTextColor: (color) => set({ textColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setDecalPosition: (pos) => set({ decalPosition: pos }),
  setDecalRotation: (rot) => set({ decalRotation: rot }),
  setDecalScale: (scale) => set({ decalScale: scale }),
}));
