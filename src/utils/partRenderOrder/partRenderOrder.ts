import type { ConfiguratorPart } from '@types';

const PART_RENDER_ORDER: Record<string, number> = {
  front: 0,
  back: 0,
  left: 0,
  right: 0,
  sleeve_left: 1,
  sleeve_right: 1,
};

const getPartRenderOrder = (part: ConfiguratorPart): number => PART_RENDER_ORDER[part] ?? 0;

export { getPartRenderOrder };
