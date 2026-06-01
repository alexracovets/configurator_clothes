'use client';

import { useGarmentStore } from '@store';
import type { PatternItem } from '@types';

import { getGarmentConfig } from '@data';

const useGarmentParts = () => {
  const { styleId, activeGarment } = useGarmentStore();
  const config = getGarmentConfig(styleId, activeGarment);

  return config.parts.map(({ key, label, name }) => ({
    key,
    label,
    name,
  }));
};

const useGarmentPatterns = (): PatternItem[] => {
  const { styleId, activeGarment } = useGarmentStore();
  const config = getGarmentConfig(styleId, activeGarment);

  return config.patterns.map(({ id, label, url }) => ({ id, label, url }));
};

const useActiveGarmentConfig = () => {
  const { styleId, activeGarment } = useGarmentStore();
  return getGarmentConfig(styleId, activeGarment);
};

export { useActiveGarmentConfig, useGarmentParts, useGarmentPatterns };
