"use client";

import { useEffect, useRef } from "react";
import { useNameStore } from "@store";
import { useConfiguratorStore } from "../store/configurator.store";

const BACK_ZONE = "back" as const;
const DEFAULT_UV = { x: 0.5, y: 0.35 };

export function useNameBridge() {
  // idMap: nameInstance.id → configurator layer id
  const idMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const sync = () => {
      const { instances, isVisible } = useNameStore.getState();
      const { addLayer, removeLayer, updateLayer } = useConfiguratorStore.getState();

      if (!isVisible) {
        for (const [, configId] of idMap.current) removeLayer(configId);
        idMap.current.clear();
        return;
      }

      const currentIds = new Set(instances.map((i) => i.id));

      // Remove stale layers
      for (const [nameId, configId] of idMap.current) {
        if (!currentIds.has(nameId)) {
          removeLayer(configId);
          idMap.current.delete(nameId);
        }
      }

      // Add or update layers
      for (const inst of instances) {
        const existing = idMap.current.get(inst.id);
        if (!existing) {
          const configId = addLayer(
            {
              type: "text",
              zone: BACK_ZONE,
              x: DEFAULT_UV.x,
              y: DEFAULT_UV.y,
              rotation: 0,
              scaleX: 0.5,
              scaleY: 0.08,
              visible: true,
              locked: false,
              text: inst.text,
              font: inst.font,
              fontSize: inst.fontSize,
              textColor: inst.textColor,
              strokeColor: inst.strokeColor,
              strokeWidth: inst.strokeWidth,
            },
            { select: false },
          );
          idMap.current.set(inst.id, configId);
        } else {
          updateLayer(existing, {
            text:        inst.text,
            font:        inst.font,
            fontSize:    inst.fontSize,
            textColor:   inst.textColor,
            strokeColor: inst.strokeColor,
            strokeWidth: inst.strokeWidth,
          });
        }
      }
    };

    sync();
    const unsub = useNameStore.subscribe(sync);
    const map   = idMap.current;
    return () => {
      unsub();
      const { removeLayer } = useConfiguratorStore.getState();
      for (const [, configId] of map) removeLayer(configId);
      map.clear();
    };
  }, []);
}
