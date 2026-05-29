export { useStepsStore } from "./useStepsStore";
export { useSelectionStore } from "./useSelectionStore";
export { useColorStore } from "./useColorStore";
export { usePatternStore, PATTERNS, SHIRT_PARTS } from "./usePatternStore";
export { useGradientStore } from "./useGradientStore";

export { useNameStore, useActiveNameInstance, DEFAULT_NAME_TEXT, NAME_DECAL_DEPTH } from "./useNameStore";
export type { NameInstance } from "./useNameStore";

export { useNumberStore, DEFAULT_NUMBER_TEXT, NUMBER_DECAL_DEPTH, NUMBER_DECAL_SCALE_MIN, NUMBER_DECAL_SCALE_MAX } from "./useNumberStore";
export type { NumberInstance } from "./useNumberStore";

export type { PatternItem } from "./usePatternStore";
export type { PartGradient, PartGradients } from "./useGradientStore";
export { NECK_DEFAULT_COLOR } from "@constants";
export type { ShirtPart, PartColors, PartPatterns, MeshRefs } from "@types";
export * from "./configuratorDesign";
