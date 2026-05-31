'use client';

import { useLogoStore } from '@store';
import { useLayerBridge } from '@hooks';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;

const POSITION_CONFIG = Object.fromEntries(shirtConfig.logoPositions.map((p) => [p.position, p])) as Record<string, (typeof shirtConfig.logoPositions)[number]>;

const useLogoBridge = () => {
  useLayerBridge(useLogoStore, (inst) => {
    const pos = POSITION_CONFIG[inst.position as string];
    if (!pos) throw new Error(`Unknown logo position: ${inst.position}`);
    const scale = inst.scale ?? 1;
    const interactive = pos.interactive;
    return {
      type: 'logo',
      zone: 'full' as const,
      x: pos.uv.x,
      y: pos.uv.y,
      rotation: inst.rotation ?? pos.rotation,
      scaleX: pos.scaleX * scale,
      scaleY: pos.scaleY * scale,
      visible: inst.visible ?? true,
      locked: !interactive,
      interactive,
      src: inst.src,
      scale,
    };
  });
};

export { useLogoBridge };
