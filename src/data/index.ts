import { crewneckStyle } from './crewneck';
import type { GarmentConfig, GarmentType, StyleConfig, StyleId } from './types';

const STYLES: Record<StyleId, StyleConfig> = {
  crewneck: crewneckStyle,
};

const getStyle = (styleId: StyleId): StyleConfig => STYLES[styleId];

const getGarmentConfig = (styleId: StyleId, garment: GarmentType): GarmentConfig => {
  const config = STYLES[styleId].garments[garment];
  if (!config) throw new Error(`Garment "${garment}" is not configured for style "${styleId}"`);
  return config;
};

const getGarmentsForStyle = (styleId: StyleId): GarmentType[] => Object.keys(STYLES[styleId].garments) as GarmentType[];

export { crewneckStyle, getGarmentConfig, getGarmentsForStyle, getStyle, STYLES };
export type {
  GarmentConfig,
  GarmentType,
  LogoPositionConfig,
  ModelPaths,
  NamePositionConfig,
  NumberPositionConfig,
  PartConfig,
  PatternConfig,
  StyleConfig,
  StyleId,
} from './types';
