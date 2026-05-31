'use client';

import { useEffect } from 'react';

import { useNameStore } from '@store';
import { registerStepSlots, useLayerBridge } from '@hooks';
import { buildPositionSlots } from '@utils';
import type { NamePosition } from '@types';

import { crewneckStyle } from '@data';

const BACK_ZONE = 'back' as const;

const shirtConfig = crewneckStyle.garments.shirt!;
const POSITION_CONFIG = Object.fromEntries(shirtConfig.namePositions.map((p) => [p.position, p])) as Record<
  NamePosition,
  (typeof shirtConfig.namePositions)[number]
>;

const NAME_SLOTS = buildPositionSlots(shirtConfig.namePositions);

const useNameBridge = () => {
  useEffect(() => registerStepSlots('name', BACK_ZONE, NAME_SLOTS), []);

  useLayerBridge(
    useNameStore,
    (inst) => {
      const pos = POSITION_CONFIG[inst.position as NamePosition];
      return {
        type: 'text',
        zone: BACK_ZONE,
        x: pos.uv.x,
        y: pos.uv.y,
        rotation: pos.rotation,
        scaleX: 0.5,
        scaleY: 0.08,
        visible: true,
        locked: !pos.interactive,
        interactive: pos.interactive,
        text: inst.text,
        font: inst.font,
        fontSize: pos.fontSize,
        textColor: inst.textColor,
        strokeColor: inst.strokeColor,
        strokeWidth: inst.strokeWidth,
      };
    },
    (state) => state.isVisible,
  );
};

export { useNameBridge };
