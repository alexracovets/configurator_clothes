'use client';

import { useEffect, useRef } from 'react';

import { useConfiguratorStore, useNameStore } from '@store';
import { setDesignSlots } from '@hooks';
import type { NameInstance, NamePosition } from '@types';

import { crewneckStyle } from '@data';

const BACK_ZONE = 'back' as const;

const shirtConfig = crewneckStyle.garments.shirt!;
const POSITION_CONFIG = Object.fromEntries(shirtConfig.namePositions.map((p) => [p.position, p])) as Record<
  NamePosition,
  (typeof shirtConfig.namePositions)[number]
>;

const NAME_SLOTS = shirtConfig.namePositions.map((p) => ({
  x: p.uv.x + 0.008,
  y: p.uv.y,
  rotation: p.rotation,
  widthFraction: 0.56,
  heightFraction: 0.12,
}));

const useNameBridge = () => {
  const idMap = useRef<Map<string, string>>(new Map());
  const prevInstancesRef = useRef<Map<string, NameInstance>>(new Map());

  useEffect(() => {
    setDesignSlots(BACK_ZONE, NAME_SLOTS);
    return () => setDesignSlots(BACK_ZONE, []);
  }, []);

  useEffect(() => {
    const sync = () => {
      const { instances, isVisible } = useNameStore.getState();
      const { addLayer, removeLayer, updateLayer } = useConfiguratorStore.getState();

      if (!isVisible) {
        for (const [, configId] of idMap.current) removeLayer(configId);
        idMap.current.clear();
        prevInstancesRef.current.clear();
        return;
      }

      const currentIds = new Set(instances.map((i) => i.id));

      for (const [nameId, configId] of idMap.current) {
        if (!currentIds.has(nameId)) {
          removeLayer(configId);
          idMap.current.delete(nameId);
          prevInstancesRef.current.delete(nameId);
        }
      }

      for (const inst of instances) {
        const pos = POSITION_CONFIG[inst.position];
        const existing = idMap.current.get(inst.id);

        if (!existing) {
          const configId = addLayer(
            {
              type: 'text',
              zone: BACK_ZONE,
              x: pos.uv.x,
              y: pos.uv.y,
              rotation: pos.rotation,
              scaleX: 0.5,
              scaleY: 0.08,
              visible: true,
              locked: true,
              text: inst.text,
              font: inst.font,
              fontSize: pos.fontSize,
              textColor: inst.textColor,
              strokeColor: inst.strokeColor,
              strokeWidth: inst.strokeWidth,
            },
            { select: false },
          );
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
          ) {
            continue;
          }
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
    const unsub = useNameStore.subscribe(sync);
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

export { useNameBridge };
