import type { DesignLayer } from "../DesignLayer";

export type DesignHitState = {
  layers: DesignLayer[];
  selectedId: string | null;
};
