import type { Mesh } from 'three';

export type ShirtPart = 'back' | 'front' | 'sleeve_left' | 'sleeve_right';

export type PartColors = Record<string, string>;
export type MeshRefs = Partial<Record<string, Mesh>>;
