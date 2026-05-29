import type { ShirtPart } from "@types";

const PART_RENDER_ORDER: Record<ShirtPart, number> = {
  front: 0,
  back: 0,
  sleeve_left: 1,
  sleeve_right: 1,
};

const getPartRenderOrder = (part: ShirtPart): number => PART_RENDER_ORDER[part];

export { getPartRenderOrder };
