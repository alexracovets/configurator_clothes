import type { NamePosition } from '@types';

// ─── Garment types ────────────────────────────────────────────────────────────

export type GarmentType = 'shirt' | 'shorts';

export type StyleId = 'crewneck'; // expand as new styles arrive

// ─── Sub-configs ──────────────────────────────────────────────────────────────

export interface PartConfig {
  key: string;
  label: string;
  name: string;
}

export interface PatternConfig {
  id: string;
  label: string;
  url: string;
}

export interface NamePositionConfig {
  position: NamePosition;
  label: string;
  uv: { x: number; y: number };
  rotation: number;
  fontSize: number;
}

export interface ModelPaths {
  gltf: string;
  bakeNormal: string;
  bakeAoRoughness: string;
  fabricNormal: string;
  fabricRoughness: string;
  insideAo: string;
}

// ─── Per-garment config ───────────────────────────────────────────────────────

export interface GarmentConfig {
  type: GarmentType;
  label: string;
  name: string;
  modelPaths: ModelPaths;
  parts: PartConfig[];
  patterns: PatternConfig[];
  namePositions: NamePositionConfig[];
  neckColor: string;
  fabricRepeat: number;
}

// ─── Per-style config ─────────────────────────────────────────────────────────

export interface StyleConfig {
  id: StyleId;
  label: string;
  garments: Partial<Record<GarmentType, GarmentConfig>>;
}
