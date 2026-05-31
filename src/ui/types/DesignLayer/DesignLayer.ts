import type { PrintZoneKey } from '@types';

type LayerType = 'text' | 'number' | 'logo';

export interface DesignLayer {
  id: string;
  type: LayerType;
  zone: PrintZoneKey;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  visible: boolean;
  locked: boolean;
  interactive?: boolean;
  text?: string;
  font?: string;
  fontSize?: number;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  src?: string;
}

export interface TextureSettings {
  resolution: number;
  transparentBackground: boolean;
}
