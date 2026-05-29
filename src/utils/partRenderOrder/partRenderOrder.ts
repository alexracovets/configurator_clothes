import type { ShirtPart } from "@store";

const PART_RENDER_ORDER: Record<ShirtPart, number> = {
  front: 0,
  back: 0,
  sleeve_left: 1,
  sleeve_right: 1,
};

export const getPartRenderOrder = (part: ShirtPart): number => PART_RENDER_ORDER[part];
