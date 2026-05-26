"use client";

import { useColorStore, usePatternStore, useGradientStore } from "@store";
import { useBaseColorTexture, useSvgTexture } from "@hooks";
import { getPartRenderOrder } from "@utils";
import { ColorLayer } from "../ColorLayer";
import { PatternLayer } from "../PatternLayer";
import type { PBRMaps } from "@types";
import type { LayerConfig } from "@types";
import { useDesignTexture } from "@features/configurator/hooks/useDesignTexture";
import type { PrintZoneKey } from "@features/configurator/texture/textureConstants";

interface PartLayersProps {
  layer: LayerConfig;
  maps: PBRMaps;
}

export const PartLayers = ({ layer, maps }: PartLayersProps) => {
  const { partColors }                          = useColorStore();
  const { partPatterns, patternOpacity, patternColor } = usePatternStore();
  const { partGradients }                       = useGradientStore();

  const baseColor   = (partColors as Record<string, string>)[layer.part] ?? "#ffffff";
  const gradient    = partGradients[layer.part];
  const patternUrl  = (partPatterns as Record<string, string>)[layer.part] || layer.defaultPatternUrl || "";

  const baseColorTexture = useBaseColorTexture(baseColor);
  const patternTexture   = useSvgTexture(patternUrl);
  const partRenderOrder  = getPartRenderOrder(layer.part);

  // Design texture for this jersey part (numbers / names via UV compositing)
  const { texture: designTexture } = useDesignTexture(layer.part as PrintZoneKey);

  return (
    <>
      {/* Layer 0 — base colour + shader gradient + PBR maps + design overlay */}
      <ColorLayer
        part={layer.part}
        geometry={layer.geometry}
        baseColorTexture={baseColorTexture}
        gradient={gradient}
        maps={maps}
        renderOrder={partRenderOrder}
        designTexture={designTexture}
      />

      {/* Layer 1 — pattern / design (unchanged — patterns are NOT affected) */}
      {patternTexture && (
        <PatternLayer
          geometry={layer.geometry}
          texture={patternTexture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
          renderOrder={partRenderOrder + 1}
        />
      )}
    </>
  );
};
