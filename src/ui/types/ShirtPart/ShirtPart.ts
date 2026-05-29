import type { Mesh } from 'three';

export type ShirtPart = 'back' | 'front' | 'sleeve_left' | 'sleeve_right';

export type PartColors = Record<ShirtPart, string>;
export type PartPatterns = Record<ShirtPart, string>;
export type MeshRefs = Partial<Record<ShirtPart, Mesh>>;
