import type { DesignLayer } from '@types';

export type DesignHitState = {
  layers: DesignLayer[];
  selectedId: string | null;
};
