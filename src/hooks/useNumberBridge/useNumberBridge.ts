'use client';

import { useEffect, useRef } from 'react';

import { useConfiguratorStore, useNumberStore } from '@store';
import { registerStepSlots } from '@hooks';
import { buildPositionSlots } from '@utils';
import type { NumberInstance, NumberPosition } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;
const POSITION_CONFIG = Object.fromEntries(shirtConfig.numberPositions.map((p) => [p.position, p])) as Record<
  NumberPosition,
  (typeof shirtConfig.numberPositions)[number]
>;

const FRONT_SLOTS = buildPositionSlots(shirtConfig.numberPositions.filter((p) => p.zone === 'front'));
const BACK_SLOTS = buildPositionSlots(shirtConfig.numberPositions.filter((p) => p.zone === 'back'));

const useNumberBridge = () => {
  const idMap = useRef<Map<string, string>>(new Map());
  const prevInstancesRef = useRef<Map<string, NumberInstance>>(new Map());

  useEffect(() => {
    const unsubFront = registerStepSlots('number', 'front', FRONT_SLOTS);
    const unsubBack = registerStepSlots('number', 'back', BACK_SLOTS);
    return () => {
      unsubFront();
      unsubBack();
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      const { instances } = useNumberStore.getState();
      const { addLayer, removeLayer, updateLayer } = useConfiguratorStore.getState();

      const currentIds = new Set(instances.map((i) => i.id));

      for (const [numberId, configId] of idMap.current) {
        if (!currentIds.has(numberId)) {
          removeLayer(configId);
          idMap.current.delete(numberId);
          prevInstancesRef.current.delete(numberId);
        }
      }

      for (const inst of instances) {
        const pos = POSITION_CONFIG[inst.position];
        const existing = idMap.current.get(inst.id);

        if (!existing) {
          const configId = addLayer({
            type: 'number',
            zone: pos.zone,
            x: pos.uv.x,
            y: pos.uv.y,
            rotation: pos.rotation,
            scaleX: 0.25,
            scaleY: 0.25,
            visible: true,
            locked: true,
            text: inst.text,
            font: inst.font,
            fontSize: pos.fontSize,
            textColor: inst.textColor,
            strokeColor: inst.strokeColor,
            strokeWidth: inst.strokeWidth,
          });
          idMap.current.set(inst.id, configId);
          prevInstancesRef.current.set(inst.id, inst);
        } else {
          const prev = prevInstancesRef.current.get(inst.id);
          if (
            prev &&
            prev.text === inst.text &&
            prev.font === inst.font &&
            prev.textColor === inst.textColor &&
            prev.strokeColor === inst.strokeColor &&
            prev.strokeWidth === inst.strokeWidth
          )
            continue;
          updateLayer(existing, {
            text: inst.text,
            font: inst.font,
            textColor: inst.textColor,
            strokeColor: inst.strokeColor,
            strokeWidth: inst.strokeWidth,
          });
          prevInstancesRef.current.set(inst.id, inst);
        }
      }
    };

    sync();
    const unsub = useNumberStore.subscribe(sync);
    const map = idMap.current;
    const prevMap = prevInstancesRef.current;
    return () => {
      unsub();
      const { removeLayer } = useConfiguratorStore.getState();
      for (const [, configId] of map) removeLayer(configId);
      map.clear();
      prevMap.clear();
    };
  }, []);
};

export { useNumberBridge };
