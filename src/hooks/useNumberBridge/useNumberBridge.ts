'use client';

import { useEffect, useRef } from 'react';

import { useConfiguratorStore, useNumberStore } from '@store';
import { registerStepSlots } from '@hooks';

const FRONT_ZONE = 'front' as const;
const DEFAULT_UV = { x: 0.5, y: 0.45 };

const NUMBER_SLOTS = [{ x: DEFAULT_UV.x, y: DEFAULT_UV.y, rotation: 0, widthFraction: 0.28, heightFraction: 0.32 }];

const useNumberBridge = () => {
  const configIdRef = useRef<string | null>(null);

  useEffect(() => registerStepSlots('number', FRONT_ZONE, NUMBER_SLOTS), []);

  useEffect(() => {
    const sync = () => {
      const { instance, isVisible } = useNumberStore.getState();
      const { addLayer, removeLayer, updateLayer } = useConfiguratorStore.getState();

      if (!isVisible || !instance) {
        if (configIdRef.current) {
          removeLayer(configIdRef.current);
          configIdRef.current = null;
        }
        return;
      }

      if (!configIdRef.current) {
        const id = addLayer({
          type: 'number',
          zone: FRONT_ZONE,
          x: DEFAULT_UV.x,
          y: DEFAULT_UV.y,
          rotation: 0,
          scaleX: 0.25,
          scaleY: 0.25,
          visible: true,
          locked: false,
          text: instance.text,
          font: instance.font,
          fontSize: instance.fontSize,
          textColor: instance.textColor,
          strokeColor: instance.strokeColor,
          strokeWidth: instance.strokeWidth,
        });
        configIdRef.current = id;
      } else {
        updateLayer(configIdRef.current, {
          text: instance.text,
          font: instance.font,
          fontSize: instance.fontSize,
          textColor: instance.textColor,
          strokeColor: instance.strokeColor,
          strokeWidth: instance.strokeWidth,
        });
      }
    };

    sync();
    const unsub = useNumberStore.subscribe(sync);
    return () => {
      unsub();
      if (configIdRef.current) {
        useConfiguratorStore.getState().removeLayer(configIdRef.current);
        configIdRef.current = null;
      }
    };
  }, []);
};

export { useNumberBridge };
