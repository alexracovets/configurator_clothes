"use client";

import { useColorStore, usePatternStore, useGradientStore } from "@store";
import { useBaseColorTexture, useSvgTexture, useDesignTexture } from "@hooks";
import { getPartRenderOrder } from "@utils";
import type { PrintZoneKey } from "@utils";
import { ColorLayer } from "../ColorLayer";
import { DesignOverlayLayer } from "../DesignOverlayLayer";
import { PatternLayer } from "../PatternLayer";
import type { PBRMaps, LayerConfig } from "@types";

interface PartLayersProps {
  layer: LayerConfig;
  maps: PBRMaps;
}

const PartLayers = ({ layer, maps }: PartLayersProps) => {
  const { partColors } = useColorStore();
  const { partPatterns, patternOpacity, patternColor } = usePatternStore();
  const { partGradients } = useGradientStore();

  const baseColor = (partColors as Record<string, string>)[layer.part] ?? "#ffffff";
  const gradient = partGradients[layer.part];
  const patternUrl = (partPatterns as Record<string, string>)[layer.part] || layer.defaultPatternUrl || "";

  const baseColorTexture = useBaseColorTexture(baseColor);
  const patternTexture = useSvgTexture(patternUrl);
  const partRenderOrder = getPartRenderOrder(layer.part);

  const { texture: designTexture } = useDesignTexture(layer.part as PrintZoneKey);

  return (
    <>
      <ColorLayer part={layer.part} geometry={layer.geometry} baseColorTexture={baseColorTexture} gradient={gradient} maps={maps} renderOrder={partRenderOrder} />
      {patternTexture && (
        <PatternLayer geometry={layer.geometry} texture={patternTexture} patternOpacity={patternOpacity} patternColor={patternColor} renderOrder={partRenderOrder + 1} />
      )}
      <DesignOverlayLayer part={layer.part} geometry={layer.geometry} designTexture={designTexture} renderOrder={partRenderOrder + 2} />
    </>
  );
};

export { PartLayers };
