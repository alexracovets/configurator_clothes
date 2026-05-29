import type { ShirtPart } from '@types';

export interface PartGradient {
  enabled: boolean;
  color2: string;
  rotation: number;
  position: number;
  softness: number;
  opacity: number;
}

export type PartGradients = Record<ShirtPart, PartGradient>;
