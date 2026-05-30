import { crewneckStyle } from './crewneck';
import type { StyleConfig, StyleId } from './types';

export { crewneckStyle } from './crewneck';
export type { GarmentConfig, GarmentType, ModelPaths, NamePositionConfig, PartConfig, PatternConfig, StyleConfig, StyleId } from './types';

const STYLES: Record<StyleId, StyleConfig> = {
  crewneck: crewneckStyle,
};

const getStyle = (id: StyleId): StyleConfig => STYLES[id];

export { getStyle, STYLES };
