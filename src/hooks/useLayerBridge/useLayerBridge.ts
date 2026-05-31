'use client';

import { useEffect, useRef } from 'react';

import { StoreApi, UseBoundStore } from 'zustand';

import { useConfiguratorStore } from '@store';
import type { DesignLayer } from '@types';

interface BridgeInstance {
  id: string;
  position?: string;
  text?: string;
  font?: string;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  src?: string;
  scale?: number;
  rotation?: number;
  visible?: boolean;
}

interface BridgeStore {
  instances: BridgeInstance[];
}

const hasChanged = (prev: BridgeInstance, next: BridgeInstance): boolean =>
  prev.text !== next.text ||
  prev.font !== next.font ||
  prev.textColor !== next.textColor ||
  prev.strokeColor !== next.strokeColor ||
  prev.strokeWidth !== next.strokeWidth ||
  prev.src !== next.src ||
  prev.scale !== next.scale ||
  prev.rotation !== next.rotation ||
  prev.visible !== next.visible;

const useLayerBridge = <T extends BridgeStore>(
  store: UseBoundStore<StoreApi<T>>,
  buildLayer: (inst: BridgeInstance) => Omit<DesignLayer, 'id'>,
  isVisible: (state: T) => boolean = () => true,
) => {
  const idMap = useRef<Map<string, string>>(new Map());
  const prevInstancesRef = useRef<Map<string, BridgeInstance>>(new Map());
  const buildLayerRef = useRef(buildLayer);

  useEffect(() => {
    buildLayerRef.current = buildLayer;
  }, [buildLayer]);

  useEffect(() => {
    const sync = () => {
      const state = store.getState();
      const { addLayer, removeLayer, updateLayer } = useConfiguratorStore.getState();

      if (!isVisible(state)) {
        for (const [, configId] of idMap.current) removeLayer(configId);
        idMap.current.clear();
        prevInstancesRef.current.clear();
        return;
      }

      const instances = state.instances as BridgeInstance[];
      const currentIds = new Set(instances.map((i) => i.id));

      for (const [instId, configId] of idMap.current) {
        if (!currentIds.has(instId)) {
          removeLayer(configId);
          idMap.current.delete(instId);
          prevInstancesRef.current.delete(instId);
        }
      }

      for (const inst of instances) {
        const existing = idMap.current.get(inst.id);
        if (!existing) {
          const configId = addLayer(buildLayerRef.current(inst));
          idMap.current.set(inst.id, configId);
          prevInstancesRef.current.set(inst.id, inst);
        } else {
          const prev = prevInstancesRef.current.get(inst.id);
          if (prev && !hasChanged(prev, inst)) continue;
          updateLayer(existing, buildLayerRef.current(inst));
          prevInstancesRef.current.set(inst.id, inst);
        }
      }
    };

    sync();
    const unsub = store.subscribe(sync);
    const map = idMap.current;
    const prevMap = prevInstancesRef.current;
    return () => {
      unsub();
      const { removeLayer } = useConfiguratorStore.getState();
      for (const [, configId] of map) removeLayer(configId);
      map.clear();
      prevMap.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export { useLayerBridge };
