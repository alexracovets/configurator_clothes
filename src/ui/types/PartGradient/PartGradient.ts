export type PartGradients = Record<string, PartGradient>;

export interface PartGradient {
  enabled: boolean;
  color2: string;
  rotation: number;
  position: number;
  softness: number;
  opacity: number;
}
