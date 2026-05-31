'use client';

import { useEffect } from 'react';

import { useNumberStore } from '@store';
import { registerStepSlots, useLayerBridge } from '@hooks';
import { buildPositionSlots } from '@utils';
import type { NumberPosition } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;
const POSITION_CONFIG = Object.fromEntries(shirtConfig.numberPositions.map((p) => [p.position, p])) as Record<
  NumberPosition,
  (typeof shirtConfig.numberPositions)[number]
>;

const FRONT_SLOTS = buildPositionSlots(shirtConfig.numberPositions.filter((p) => p.zone === 'front'));
const BACK_SLOTS = buildPositionSlots(shirtConfig.numberPositions.filter((p) => p.zone === 'back'));

const useNumberBridge = () => {
  useEffect(() => {
    const unsubFront = registerStepSlots('number', 'front', FRONT_SLOTS);
    const unsubBack = registerStepSlots('number', 'back', BACK_SLOTS);
    return () => {
      unsubFront();
      unsubBack();
    };
  }, []);

  useLayerBridge(useNumberStore, (inst) => {
    const pos = POSITION_CONFIG[inst.position as NumberPosition];
    return {
      type: 'number',
      zone: pos.zone,
      x: pos.uv.x,
      y: pos.uv.y,
      rotation: pos.rotation,
      scaleX: 0.25,
      scaleY: 0.25,
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
  });
};

export { useNumberBridge };
